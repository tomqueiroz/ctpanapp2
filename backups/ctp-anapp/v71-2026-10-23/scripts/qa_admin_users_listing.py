#!/usr/bin/env python3
"""QA autenticado da listagem administrativa completa de usuários."""

from __future__ import annotations

import datetime as dt
import json
import os
import secrets
import subprocess
import urllib.error
import urllib.parse
import urllib.request

PROJECT_REF = "egihufoowzfykieozusr"
SUPABASE_URL = f"https://{PROJECT_REF}.supabase.co"
SITE_ORIGIN = "https://ctp-anapp-3.skywork.website"


def request(
    url: str,
    *,
    method: str = "GET",
    body: object | None = None,
    headers: dict[str, str] | None = None,
) -> tuple[int, object | None]:
    request_headers = {"Content-Type": "application/json", **(headers or {})}
    req = urllib.request.Request(
        url,
        data=None if body is None else json.dumps(body).encode("utf-8"),
        method=method,
        headers=request_headers,
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as response:
            raw = response.read().decode("utf-8", errors="replace")
            return response.status, json.loads(raw) if raw else None
    except urllib.error.HTTPError as error:
        raw = error.read().decode("utf-8", errors="replace")
        try:
            payload = json.loads(raw) if raw else None
        except json.JSONDecodeError:
            payload = {"raw": raw[:500]}
        return error.code, payload


def api_keys(access_token: str) -> tuple[str, str]:
    env = os.environ.copy()
    env["SUPABASE_ACCESS_TOKEN"] = access_token
    result = subprocess.run(
        [
            "npx",
            "--yes",
            "supabase@2.111.0",
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
    keys = json.loads(result.stdout)
    service_role = next(row["api_key"] for row in keys if row["id"] == "service_role")
    anon = next(row["api_key"] for row in keys if row["id"] == "anon")
    return service_role, anon


def invoke(
    anon: str,
    access: str | None,
    body: dict[str, object],
) -> tuple[int, object | None]:
    headers = {"apikey": anon, "Origin": SITE_ORIGIN}
    if access:
        headers["Authorization"] = f"Bearer {access}"
    return request(
        f"{SUPABASE_URL}/functions/v1/admin_manage_user",
        method="POST",
        body=body,
        headers=headers,
    )


def create_auth_user(
    headers: dict[str, str],
    *,
    email: str,
    password: str,
    full_name: str,
) -> str:
    status, payload = request(
        f"{SUPABASE_URL}/auth/v1/admin/users",
        method="POST",
        body={
            "email": email,
            "password": password,
            "email_confirm": True,
            "user_metadata": {"full_name": full_name},
        },
        headers=headers,
    )
    if status != 200 or not isinstance(payload, dict) or not payload.get("id"):
        raise RuntimeError(f"Falha ao criar usuário de QA: HTTP {status}")
    return str(payload["id"])


def upsert(
    headers: dict[str, str],
    table: str,
    payload: dict[str, object],
) -> None:
    status, _ = request(
        f"{SUPABASE_URL}/rest/v1/{table}",
        method="POST",
        body=payload,
        headers={**headers, "Prefer": "resolution=merge-duplicates"},
    )
    if status not in (200, 201):
        raise RuntimeError(f"Falha ao preparar {table}: HTTP {status}")


def signin(anon: str, email: str, password: str) -> str:
    status, payload = request(
        f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
        method="POST",
        body={"email": email, "password": password},
        headers={"apikey": anon},
    )
    if status != 200 or not isinstance(payload, dict):
        raise RuntimeError(f"Falha no login de QA: HTTP {status}")
    access = payload.get("access_token")
    if not isinstance(access, str):
        raise RuntimeError("Token de sessão de QA não retornado.")
    return access


def main() -> None:
    access_token = os.environ.get("SUPABASE_ACCESS_TOKEN", "")
    if not access_token:
        raise SystemExit("SUPABASE_ACCESS_TOKEN ausente.")

    service_role, anon = api_keys(access_token)
    service_headers = {
        "apikey": service_role,
        "Authorization": f"Bearer {service_role}",
    }
    suffix = secrets.token_hex(6)
    password = f"QaUsers!{secrets.token_urlsafe(20)}9aA"
    admin_email = f"tom.queiroz+qa-users-admin-{suffix}@pareto.plus"
    student_email = f"tom.queiroz+qa-users-new-{suffix}@pareto.plus"
    alumni_email = f"tom.queiroz+qa-users-alumni-{suffix}@pareto.plus"
    user_ids: list[str] = []
    report: dict[str, object] = {
        "guest_blocked_401": False,
        "non_admin_blocked_403": False,
        "admin_authenticated": False,
        "list_users_ok": False,
        "personal_fields_returned": False,
        "new_student_last_60_days": False,
        "alumni_precedence_over_new": False,
        "administrative_classification": False,
        "cleanup": False,
    }

    try:
        guest_status, _ = invoke(anon, None, {"action": "list_users"})
        report["guest_blocked_401"] = guest_status == 401

        admin_id = create_auth_user(
            service_headers,
            email=admin_email,
            password=password,
            full_name="QA ADMIN USUÁRIOS",
        )
        user_ids.append(admin_id)
        student_id = create_auth_user(
            service_headers,
            email=student_email,
            password=password,
            full_name="QA NOVO ALUNO",
        )
        user_ids.append(student_id)
        alumni_id = create_auth_user(
            service_headers,
            email=alumni_email,
            password=password,
            full_name="QA EX ALUNO",
        )
        user_ids.append(alumni_id)

        now = dt.datetime.now(dt.timezone.utc).isoformat()
        for user_id, email, full_name, is_alumni in (
            (admin_id, admin_email, "QA ADMIN USUÁRIOS", False),
            (student_id, student_email, "QA NOVO ALUNO", False),
            (alumni_id, alumni_email, "QA EX ALUNO", True),
        ):
            upsert(
                service_headers,
                "profiles",
                {
                    "id": user_id,
                    "email": email,
                    "full_name": full_name,
                    "has_paid": False,
                    "is_alumni": is_alumni,
                    "updated_at": now,
                },
            )

        for user_id, role, full_name, origin in (
            (admin_id, "admin", "QA ADMIN USUÁRIOS", "admin"),
            (student_id, "student", "QA NOVO ALUNO", "new_student"),
            (alumni_id, "student", "QA EX ALUNO", "alumni"),
        ):
            status, _ = request(
                f"{SUPABASE_URL}/rest/v1/user_roles?user_id=eq.{urllib.parse.quote(user_id)}",
                method="PATCH",
                body={
                    "role": role,
                    "full_name": full_name,
                    "user_origin": origin,
                    "access_blocked": False,
                },
                headers={**service_headers, "Prefer": "return=minimal"},
            )
            if status not in (200, 204):
                raise RuntimeError(f"Falha ao atribuir perfil de QA: HTTP {status}")

        upsert(
            service_headers,
            "user_extended_profile",
            {
                "user_id": student_id,
                "first_name": "QA NOVO",
                "last_name": "ALUNO",
                "phone": "(11) 99999-0000",
                "rg": "12.345.678-9",
                "cpf": "529.982.247-25",
                "street": "Rua de Validação",
                "number": "100",
                "complement": "Sala 2",
                "neighborhood": "Centro",
                "city": "São Paulo",
                "state": "SP",
                "zip_code": "01001-000",
                "gender": "prefiro_nao_informar",
                "profile_completed": True,
                "updated_at": now,
            },
        )

        admin_access = signin(anon, admin_email, password)
        report["admin_authenticated"] = True
        student_access = signin(anon, student_email, password)
        non_admin_status, _ = invoke(
            anon,
            student_access,
            {"action": "list_users"},
        )
        report["non_admin_blocked_403"] = non_admin_status == 403

        list_status, payload = invoke(
            anon,
            admin_access,
            {"action": "list_users"},
        )
        users = (
            payload.get("users")
            if isinstance(payload, dict) and isinstance(payload.get("users"), list)
            else []
        )
        report["list_users_ok"] = list_status == 200 and bool(users)
        by_id = {
            str(row.get("id")): row
            for row in users
            if isinstance(row, dict) and row.get("id")
        }
        new_student = by_id.get(student_id, {})
        alumni = by_id.get(alumni_id, {})
        admin = by_id.get(admin_id, {})
        required_fields = {
            "full_name",
            "email",
            "phone",
            "rg",
            "cpf",
            "street",
            "address_number",
            "complement",
            "neighborhood",
            "city",
            "state",
            "zip_code",
            "gender",
            "created_at",
        }
        report["personal_fields_returned"] = (
            required_fields.issubset(new_student.keys())
            and new_student.get("registration_complete") is True
        )
        report["new_student_last_60_days"] = (
            new_student.get("student_classification") == "new_student"
            and new_student.get("is_new_student") is True
        )
        report["alumni_precedence_over_new"] = (
            alumni.get("student_classification") == "alumni"
            and alumni.get("is_alumni") is True
            and alumni.get("is_new_student") is False
        )
        report["administrative_classification"] = (
            admin.get("student_classification") == "administrative"
        )
    finally:
        cleanup_ok = True
        for user_id in reversed(user_ids):
            status, _ = request(
                f"{SUPABASE_URL}/auth/v1/admin/users/{urllib.parse.quote(user_id)}",
                method="DELETE",
                headers=service_headers,
            )
            cleanup_ok = cleanup_ok and status in (200, 204, 404)
        report["cleanup"] = cleanup_ok
        print(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True))

    failed = [key for key, value in report.items() if value is not True]
    if failed:
        raise SystemExit(f"QA falhou: {', '.join(failed)}")


if __name__ == "__main__":
    main()
