#!/usr/bin/env python3
"""End-to-end LMS QA with a synthetic user that is deleted afterwards."""

from __future__ import annotations

import json
import os
import secrets
import subprocess
import time
import urllib.error
import urllib.parse
import urllib.request

PROJECT_REF = "egihufoowzfykieozusr"
URL = f"https://{PROJECT_REF}.supabase.co"


def http(url, *, method="GET", body=None, headers=None, allow_error=False):
    req = urllib.request.Request(
        url,
        data=None if body is None else json.dumps(body).encode(),
        method=method,
        headers={"Content-Type": "application/json", **(headers or {})},
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as response:
            raw = response.read()
            return response.status, json.loads(raw) if raw else None
    except urllib.error.HTTPError as error:
        raw = error.read().decode(errors="ignore")
        if allow_error:
            try:
                return error.code, json.loads(raw)
            except json.JSONDecodeError:
                return error.code, {"raw": raw[:500]}
        raise RuntimeError(f"HTTP {error.code}: {raw[:500]}") from error


def main():
    pat = os.environ["SUPABASE_ACCESS_TOKEN"]
    env = os.environ.copy()
    env["SUPABASE_ACCESS_TOKEN"] = pat
    result = subprocess.run(
        [
            "npx", "supabase", "projects", "api-keys",
            "--project-ref", PROJECT_REF, "--output", "json",
        ],
        check=True,
        capture_output=True,
        text=True,
        env=env,
        timeout=60,
    )
    keys = json.loads(result.stdout)
    service = next(item["api_key"] for item in keys if item["id"] == "service_role")
    anon = next(item["api_key"] for item in keys if item["id"] == "anon")
    service_headers = {"apikey": service, "Authorization": f"Bearer {service}"}
    email = os.environ.get("QA_EMAIL", "").strip().lower()
    if not email:
        raise SystemExit(
            "QA_EMAIL ausente. Informe um endereço real autorizado; "
            "domínios descartáveis não são permitidos."
        )
    password = secrets.token_urlsafe(24) + "Aa1!"
    user_id = None

    report = {
        "sequential_lock": False,
        "sanitized_questions": False,
        "exams_passed": 0,
        "unlimited_retry": False,
        "best_score_preserved": False,
        "eligible": False,
        "certificate_generated": False,
        "certificate_download_ready": False,
        "cleanup": False,
    }

    try:
        http(
            f"{URL}/rest/v1/rpc/admin_import_alumni",
            method="POST",
            body={
                "p_email": email,
                "p_full_name": "USUÁRIO QA CTP ANAPP",
                "p_cpf": "00000000000",
                "p_phone": None,
                "p_alumni_type": "alumni",
                "p_cert_number": None,
                "p_year": 2026,
            },
            headers=service_headers,
        )
        _, user = http(
            f"{URL}/auth/v1/admin/users",
            method="POST",
            body={
                "email": email,
                "password": password,
                "email_confirm": True,
                "user_metadata": {"full_name": "USUÁRIO QA CTP ANAPP", "cpf": "00000000000"},
            },
            headers=service_headers,
        )
        user_id = user["id"]
        http(
            f"{URL}/rest/v1/rpc/check_alumni_and_grant_access",
            method="POST",
            body={"p_user_id": user_id, "p_email": email},
            headers=service_headers,
        )
        _, session = http(
            f"{URL}/auth/v1/token?grant_type=password",
            method="POST",
            body={"email": email, "password": password},
            headers={"apikey": anon},
        )
        access_token = session["access_token"]
        user_headers = {"apikey": anon, "Authorization": f"Bearer {access_token}"}

        _, chapters = http(
            f"{URL}/rest/v1/chapters?select=id,chapter_number&order=chapter_number.asc",
            headers=service_headers,
        )
        chapter_order = {row["id"]: row["chapter_number"] for row in chapters}
        _, exams = http(
            f"{URL}/rest/v1/exams?select=id,chapter_id,passing_score",
            headers=service_headers,
        )
        exams.sort(key=lambda row: chapter_order[row["chapter_id"]])
        assert exams and all(row["passing_score"] == 70 for row in exams)

        if len(exams) > 1:
            status, _ = http(
                f"{URL}/rest/v1/rpc/lms_get_exam",
                method="POST",
                body={"p_exam_id": exams[1]["id"]},
                headers=user_headers,
                allow_error=True,
            )
            report["sequential_lock"] = status == 400

        for exam in exams:
            _, delivered = http(
                f"{URL}/rest/v1/rpc/lms_get_exam",
                method="POST",
                body={"p_exam_id": exam["id"]},
                headers=user_headers,
            )
            questions = delivered["questions"]
            report["sanitized_questions"] = report["sanitized_questions"] or bool(questions)
            assert all("correct_answer" not in question for question in questions)

            _, correct = http(
                f"{URL}/rest/v1/exam_questions?select=id,correct_answer&exam_id=eq.{exam['id']}",
                headers=service_headers,
            )
            answers = {row["id"]: row["correct_answer"] for row in correct}
            _, submission = http(
                f"{URL}/rest/v1/rpc/lms_submit_exam",
                method="POST",
                body={"p_exam_id": exam["id"], "p_answers": answers},
                headers=user_headers,
            )
            assert submission["is_passed"] and float(submission["score"]) == 100
            report["exams_passed"] += 1

        first = exams[0]
        _, first_questions = http(
            f"{URL}/rest/v1/exam_questions?select=id&exam_id=eq.{first['id']}",
            headers=service_headers,
        )
        wrong_answers = {row["id"]: 99 for row in first_questions}
        _, retry = http(
            f"{URL}/rest/v1/rpc/lms_submit_exam",
            method="POST",
            body={"p_exam_id": first["id"], "p_answers": wrong_answers},
            headers=user_headers,
        )
        report["unlimited_retry"] = retry["attempts_count"] >= 2
        report["best_score_preserved"] = float(retry["best_score"]) == 100

        _, eligibility = http(
            f"{URL}/rest/v1/rpc/lms_certificate_eligibility",
            method="POST",
            body={"p_user_id": user_id},
            headers=user_headers,
        )
        report["eligible"] = bool(eligibility["eligible"])

        _, generated = http(
            f"{URL}/functions/v1/generate_certificate",
            method="POST",
            body={},
            headers=user_headers,
        )
        report["certificate_generated"] = bool(generated["success"])
        _, downloadable = http(
            f"{URL}/functions/v1/download_certificate_pdf",
            method="POST",
            body={},
            headers=user_headers,
        )
        report["certificate_download_ready"] = bool(downloadable["success"])
    finally:
        if user_id:
            for table in (
                "certificates",
                "exam_attempts",
                "user_exam_scores",
                "user_progress",
                "user_extended_profile",
                "profiles",
                "user_roles",
            ):
                http(
                    f"{URL}/rest/v1/{table}?{'user_id' if table != 'profiles' else 'id'}=eq.{user_id}",
                    method="DELETE",
                    headers={**service_headers, "Prefer": "return=minimal"},
                    allow_error=True,
                )
            http(
                f"{URL}/auth/v1/admin/users/{user_id}",
                method="DELETE",
                headers=service_headers,
                allow_error=True,
            )
        http(
            f"{URL}/rest/v1/alumni_whitelist?email=eq.{urllib.parse.quote(email)}",
            method="DELETE",
            headers={**service_headers, "Prefer": "return=minimal"},
            allow_error=True,
        )
        report["cleanup"] = True

    print(json.dumps(report, ensure_ascii=False, indent=2))
    if not all(report.values()):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
