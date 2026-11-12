#!/usr/bin/env python3
"""Regression QA for the final LMS security/admin/certificate hardening."""

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
    request = urllib.request.Request(
        url,
        data=None if body is None else json.dumps(body).encode(),
        method=method,
        headers={"Content-Type": "application/json", **(headers or {})},
    )
    try:
        with urllib.request.urlopen(request, timeout=90) as response:
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


def create_user(service_headers, email, password, full_name):
    _, user = http(
        f"{URL}/auth/v1/admin/users",
        method="POST",
        body={
            "email": email,
            "password": password,
            "email_confirm": True,
            "user_metadata": {"full_name": full_name, "cpf": "00000000000"},
        },
        headers=service_headers,
    )
    return user["id"]


def sign_in(anon_key, email, password):
    _, session = http(
        f"{URL}/auth/v1/token?grant_type=password",
        method="POST",
        body={"email": email, "password": password},
        headers={"apikey": anon_key},
    )
    return {
        "apikey": anon_key,
        "Authorization": f"Bearer {session['access_token']}",
    }


def delete_user_data(service_headers, user_id):
    cleanup_tables = (
        "certificates",
        "quiz_attempts",
        "user_quiz_scores",
        "exam_attempts",
        "user_exam_scores",
        "user_progress",
        "student_enrollments",
        "student_email_events",
        "user_extended_profile",
        "payments",
        "profiles",
        "user_roles",
    )
    for table in cleanup_tables:
        column = "id" if table == "profiles" else "user_id"
        http(
            f"{URL}/rest/v1/{table}?{column}=eq.{user_id}",
            method="DELETE",
            headers={**service_headers, "Prefer": "return=minimal"},
            allow_error=True,
        )
    http(
        f"{URL}/rest/v1/lms_admin_audit_log?target_user_id=eq.{user_id}",
        method="DELETE",
        headers={**service_headers, "Prefer": "return=minimal"},
        allow_error=True,
    )
    http(
        f"{URL}/rest/v1/lms_admin_audit_log?actor_user_id=eq.{user_id}",
        method="DELETE",
        headers={**service_headers, "Prefer": "return=minimal"},
        allow_error=True,
    )
    http(
        f"{URL}/rest/v1/audit_log?user_id=eq.{user_id}",
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


def main():
    access_token = os.environ["SUPABASE_ACCESS_TOKEN"]
    env = os.environ.copy()
    env["SUPABASE_ACCESS_TOKEN"] = access_token
    keys_result = subprocess.run(
        [
            "npx",
            "--yes",
            "supabase",
            "projects",
            "api-keys",
            "--project-ref",
            PROJECT_REF,
            "--output",
            "json",
        ],
        check=True,
        capture_output=True,
        text=True,
        env=env,
        timeout=90,
    )
    keys = json.loads(keys_result.stdout)
    service_key = next(item["api_key"] for item in keys if item["id"] == "service_role")
    anon_key = next(item["api_key"] for item in keys if item["id"] == "anon")
    service_headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
    }

    suffix = f"{int(time.time())}-{secrets.token_hex(3)}"
    admin_email = f"qa-master-{suffix}@recognise.com.br"
    student_email = f"qa-student-{suffix}@recognise.com.br"
    invited_email = f"qa-invited-{suffix}@recognise.com.br"
    password = secrets.token_urlsafe(24) + "Aa1!"
    created_user_ids = []

    report = {
        "unpaid_exam_blocked": False,
        "unpaid_quiz_blocked": False,
        "direct_exam_score_write_blocked": False,
        "direct_quiz_score_write_blocked": False,
        "admin_grade_list": False,
        "admin_exam_grade_audited": False,
        "admin_quiz_grade_audited": False,
        "admin_free_access": False,
        "quiz_questions_sanitized": False,
        "quiz_server_graded": False,
        "quiz_result_review_after_submit": False,
        "exam_server_graded": False,
        "manual_certificate_fields": False,
        "admin_invite_user": False,
        "cleanup": False,
    }

    try:
        admin_id = create_user(
            service_headers,
            admin_email,
            password,
            "MASTER QA CTP ANAPP",
        )
        student_id = create_user(
            service_headers,
            student_email,
            password,
            "ALUNO QA CTP ANAPP",
        )
        created_user_ids.extend([admin_id, student_id])

        for table, payload in (
            (
                "profiles",
                {
                    "id": admin_id,
                    "email": admin_email,
                    "full_name": "MASTER QA CTP ANAPP",
                    "has_paid": True,
                },
            ),
            (
                "user_roles",
                {
                    "user_id": admin_id,
                    "role": "master_admin",
                    "full_name": "MASTER QA CTP ANAPP",
                    "user_origin": "admin",
                },
            ),
            (
                "profiles",
                {
                    "id": student_id,
                    "email": student_email,
                    "full_name": "ALUNO QA CTP ANAPP",
                    "has_paid": False,
                },
            ),
            (
                "user_roles",
                {
                    "user_id": student_id,
                    "role": "student",
                    "full_name": "ALUNO QA CTP ANAPP",
                    "user_origin": "new_student",
                },
            ),
        ):
            http(
                f"{URL}/rest/v1/{table}?on_conflict={'id' if table == 'profiles' else 'user_id'}",
                method="POST",
                body=payload,
                headers={
                    **service_headers,
                    "Prefer": "resolution=merge-duplicates,return=minimal",
                },
            )

        admin_headers = sign_in(anon_key, admin_email, password)
        student_headers = sign_in(anon_key, student_email, password)

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
        first_exam = exams[0]
        _, quizzes = http(
            f"{URL}/rest/v1/quizzes?select=id,chapter_id,passing_score",
            headers=service_headers,
        )
        quizzes.sort(key=lambda row: chapter_order[row["chapter_id"]])
        first_quiz = next(
            quiz for quiz in quizzes if chapter_order[quiz["chapter_id"]] >= 1
        )

        status, _ = http(
            f"{URL}/rest/v1/rpc/lms_get_exam",
            method="POST",
            body={"p_exam_id": first_exam["id"]},
            headers=student_headers,
            allow_error=True,
        )
        report["unpaid_exam_blocked"] = status == 400

        status, _ = http(
            f"{URL}/rest/v1/rpc/lms_get_quiz",
            method="POST",
            body={"p_quiz_id": first_quiz["id"]},
            headers=student_headers,
            allow_error=True,
        )
        report["unpaid_quiz_blocked"] = status == 400

        status, _ = http(
            f"{URL}/rest/v1/user_exam_scores",
            method="POST",
            body={
                "user_id": student_id,
                "exam_id": first_exam["id"],
                "chapter_id": first_exam["chapter_id"],
                "best_score": 100,
                "attempts_count": 1,
            },
            headers=student_headers,
            allow_error=True,
        )
        report["direct_exam_score_write_blocked"] = status in (401, 403)

        status, _ = http(
            f"{URL}/rest/v1/user_quiz_scores",
            method="POST",
            body={
                "user_id": student_id,
                "quiz_id": first_quiz["id"],
                "best_score": 100,
                "attempts_count": 1,
            },
            headers=student_headers,
            allow_error=True,
        )
        report["direct_quiz_score_write_blocked"] = status in (401, 403)

        _, grade_list = http(
            f"{URL}/rest/v1/rpc/admin_list_grades",
            method="POST",
            body={"target_user_id": student_id},
            headers=admin_headers,
        )
        report["admin_grade_list"] = bool(grade_list["exams"] and grade_list["quizzes"])

        http(
            f"{URL}/rest/v1/rpc/admin_update_exam_grade",
            method="POST",
            body={
                "target_user_id": student_id,
                "p_exam_id": first_exam["id"],
                "p_score": 72,
                "p_reason": "QA de ajuste administrativo",
            },
            headers=admin_headers,
        )
        http(
            f"{URL}/rest/v1/rpc/admin_update_quiz_grade",
            method="POST",
            body={
                "target_user_id": student_id,
                "p_quiz_id": first_quiz["id"],
                "p_score": 74,
                "p_reason": "QA de ajuste administrativo",
            },
            headers=admin_headers,
        )
        _, audit_rows = http(
            f"{URL}/rest/v1/lms_admin_audit_log"
            f"?select=action&target_user_id=eq.{student_id}"
            "&action=in.(admin_update_exam_grade,admin_update_quiz_grade)",
            headers=service_headers,
        )
        actions = {row["action"] for row in audit_rows}
        report["admin_exam_grade_audited"] = "admin_update_exam_grade" in actions
        report["admin_quiz_grade_audited"] = "admin_update_quiz_grade" in actions

        http(
            f"{URL}/rest/v1/rpc/admin_grant_payment",
            method="POST",
            body={
                "target_user_id": student_id,
                "payment_amount": 0,
                "payment_method": "admin_free_access",
                "payment_notes": "QA de gratuidade administrativa",
            },
            headers=admin_headers,
        )
        _, access_context = http(
            f"{URL}/rest/v1/rpc/lms_access_context",
            method="POST",
            body={},
            headers=student_headers,
        )
        report["admin_free_access"] = bool(access_context["can_access_paid_content"])

        _, quiz = http(
            f"{URL}/rest/v1/rpc/lms_get_quiz",
            method="POST",
            body={"p_quiz_id": first_quiz["id"]},
            headers=student_headers,
        )
        report["quiz_questions_sanitized"] = bool(quiz["questions"]) and all(
            "correct_option" not in question and "explanation" not in question
            for question in quiz["questions"]
        )
        _, correct_quiz = http(
            f"{URL}/rest/v1/quiz_questions"
            f"?select=id,correct_option&quiz_id=eq.{first_quiz['id']}",
            headers=service_headers,
        )
        quiz_answers = {
            row["id"]: str(row["correct_option"]).strip().upper()
            for row in correct_quiz
        }
        _, quiz_submission = http(
            f"{URL}/rest/v1/rpc/lms_submit_quiz",
            method="POST",
            body={"p_quiz_id": first_quiz["id"], "p_answers": quiz_answers},
            headers=student_headers,
        )
        report["quiz_server_graded"] = (
            quiz_submission["is_passed"] and float(quiz_submission["score"]) == 100
        )
        _, quiz_result = http(
            f"{URL}/rest/v1/rpc/lms_get_quiz_result",
            method="POST",
            body={"p_attempt_id": quiz_submission["attempt_id"]},
            headers=student_headers,
        )
        report["quiz_result_review_after_submit"] = bool(
            quiz_result["questions"]
        ) and all("correct_option" in question for question in quiz_result["questions"])

        _, delivered_exam = http(
            f"{URL}/rest/v1/rpc/lms_get_exam",
            method="POST",
            body={"p_exam_id": first_exam["id"]},
            headers=student_headers,
        )
        assert all("correct_answer" not in question for question in delivered_exam["questions"])
        _, correct_exam = http(
            f"{URL}/rest/v1/exam_questions"
            f"?select=id,correct_answer&exam_id=eq.{first_exam['id']}",
            headers=service_headers,
        )
        exam_answers = {row["id"]: row["correct_answer"] for row in correct_exam}
        _, exam_submission = http(
            f"{URL}/rest/v1/rpc/lms_submit_exam",
            method="POST",
            body={"p_exam_id": first_exam["id"], "p_answers": exam_answers},
            headers=student_headers,
        )
        report["exam_server_graded"] = (
            exam_submission["is_passed"] and float(exam_submission["score"]) == 100
        )

        _, manual_certificate = http(
            f"{URL}/rest/v1/rpc/admin_issue_certificate",
            method="POST",
            body={
                "target_user_id": student_id,
                "cert_number": None,
                "cert_full_name": "ALUNO QA CTP ANAPP",
                "cert_cpf": "00000000000",
            },
            headers=admin_headers,
        )
        _, certificate_rows = http(
            f"{URL}/rest/v1/certificates"
            f"?select=certificate_number,verification_code,total_hours,full_name,cpf"
            f"&user_id=eq.{student_id}&is_valid=eq.true",
            headers=service_headers,
        )
        certificate = certificate_rows[0]
        report["manual_certificate_fields"] = bool(
            manual_certificate["certificate_number"]
            and certificate["verification_code"]
            and certificate["total_hours"] == 160
            and certificate["full_name"] == "ALUNO QA CTP ANAPP"
            and certificate["cpf"] == "00000000000"
        )

        _, invited = http(
            f"{URL}/functions/v1/admin_manage_user",
            method="POST",
            body={
                "action": "create_user",
                "email": invited_email,
                "full_name": "CONVIDADO QA CTP ANAPP",
                "role": "student",
                "free_access": True,
                "is_anapp_member": False,
            },
            headers=admin_headers,
        )
        invited_id = invited["user_id"]
        created_user_ids.append(invited_id)
        report["admin_invite_user"] = bool(
            invited["success"] and invited["invitation_sent"]
        )
    finally:
        for user_id in reversed(created_user_ids):
            delete_user_data(service_headers, user_id)
        http(
            f"{URL}/rest/v1/alumni_whitelist?email=in.("
            f"{urllib.parse.quote(admin_email)},"
            f"{urllib.parse.quote(student_email)},"
            f"{urllib.parse.quote(invited_email)})",
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
