#!/usr/bin/env python3
"""QA autenticado: Admin comum bloqueia/desbloqueia e exclui alunos."""

from __future__ import annotations

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
    req = urllib.request.Request(
        url,
        data=None if body is None else json.dumps(body).encode("utf-8"),
        method=method,
        headers={"Content-Type": "application/json", **(headers or {})},
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
            payload = {"raw": raw[:300]}
        return error.code, payload


def api_keys(access_token: str) -> tuple[str, str]:
    environment = os.environ.copy()
    environment["SUPABASE_ACCESS_TOKEN"] = access_token
    result = subprocess.run(
        [
            "npx",
            "--yes",
            "supabase@2.116.0",
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
        env=environment,
        timeout=90,
    )
    keys = json.loads(result.stdout)
    service_role = next(
        row["api_key"] for row in keys
        if row.get("id") == "service_role" or row.get("name") == "service_role"
    )
    anon = next(
        row["api_key"] for row in keys
        if row.get("id") == "anon" or row.get("name") == "anon"
    )
    return service_role, anon


def create_user(
    headers: dict[str, str],
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


def update_user_role(
    headers: dict[str, str],
    user_id: str,
    role: str,
    full_name: str,
) -> None:
    status, _ = request(
        f"{SUPABASE_URL}/rest/v1/user_roles"
        f"?user_id=eq.{urllib.parse.quote(user_id)}",
        method="PATCH",
        body={
            "role": role,
            "full_name": full_name,
            "access_blocked": False,
            "user_origin": "admin" if role == "admin" else "new_student",
        },
        headers={**headers, "Prefer": "return=minimal"},
    )
    if status not in (200, 204):
        raise RuntimeError(f"Falha ao preparar user_roles: HTTP {status}")


def signin(anon: str, email: str, password: str) -> str:
    status, payload = request(
        f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
        method="POST",
        body={"email": email, "password": password},
        headers={"apikey": anon},
    )
    if status != 200 or not isinstance(payload, dict):
        raise RuntimeError(f"Falha no login Admin de QA: HTTP {status}")
    access_token = payload.get("access_token")
    if not isinstance(access_token, str):
        raise RuntimeError("Sessão Admin de QA não retornada.")
    return access_token


def invoke(
    anon: str,
    access_token: str,
    body: dict[str, object],
) -> tuple[int, object | None]:
    return request(
        f"{SUPABASE_URL}/functions/v1/admin_manage_user",
        method="POST",
        body=body,
        headers={
            "apikey": anon,
            "Authorization": f"Bearer {access_token}",
            "Origin": SITE_ORIGIN,
        },
    )


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
    password = f"QaAccess!{secrets.token_urlsafe(20)}9aA"
    admin_email = f"tom.queiroz+qa-access-admin-{suffix}@pareto.plus"
    student_email = f"tom.queiroz+qa-access-student-{suffix}@pareto.plus"
    delete_email = f"tom.queiroz+qa-delete-student-{suffix}@pareto.plus"
    protected_admin_email = (
        f"tom.queiroz+qa-protected-admin-{suffix}@pareto.plus"
    )
    user_ids: list[str] = []
    report: dict[str, object] = {
        "admin_authenticated": False,
        "student_block_request_ok": False,
        "student_blocked_in_role": False,
        "student_blocked_in_auth": False,
        "student_unblock_request_ok": False,
        "student_unblocked_in_role": False,
        "student_unblocked_in_auth": False,
        "admin_cannot_delete_admin": False,
        "student_delete_request_ok": False,
        "student_deleted_from_auth": False,
        "delete_audit_recorded": False,
        "cleanup": False,
    }

    try:
        admin_id = create_user(
            service_headers,
            admin_email,
            password,
            "QA ADMIN CONTROLE DE ACESSO",
        )
        student_id = create_user(
            service_headers,
            student_email,
            password,
            "QA ALUNO BLOQUEIO",
        )
        delete_id = create_user(
            service_headers,
            delete_email,
            password,
            "QA ALUNO EXCLUSAO",
        )
        protected_admin_id = create_user(
            service_headers,
            protected_admin_email,
            password,
            "QA ADMIN PROTEGIDO",
        )
        user_ids.extend(
            [admin_id, student_id, delete_id, protected_admin_id]
        )

        for user_id, email, full_name, role in (
            (
                admin_id,
                admin_email,
                "QA ADMIN CONTROLE DE ACESSO",
                "admin",
            ),
            (
                student_id,
                student_email,
                "QA ALUNO BLOQUEIO",
                "student",
            ),
            (
                delete_id,
                delete_email,
                "QA ALUNO EXCLUSAO",
                "student",
            ),
            (
                protected_admin_id,
                protected_admin_email,
                "QA ADMIN PROTEGIDO",
                "admin",
            ),
        ):
            upsert(
                service_headers,
                "profiles",
                {
                    "id": user_id,
                    "email": email,
                    "full_name": full_name,
                    "has_paid": role == "student",
                },
            )
            update_user_role(
                service_headers,
                user_id,
                role,
                full_name,
            )

        admin_access = signin(anon, admin_email, password)
        report["admin_authenticated"] = True

        block_status, block_payload = invoke(
            anon,
            admin_access,
            {
                "action": "update_role",
                "target_user_id": student_id,
                "new_role": "student",
                "new_access_blocked": True,
            },
        )
        report["student_block_request_ok"] = (
            block_status == 200
            and isinstance(block_payload, dict)
            and block_payload.get("success") is True
        )

        role_status, role_payload = request(
            f"{SUPABASE_URL}/rest/v1/user_roles"
            f"?user_id=eq.{urllib.parse.quote(student_id)}"
            "&select=access_blocked",
            headers=service_headers,
        )
        report["student_blocked_in_role"] = (
            role_status == 200
            and isinstance(role_payload, list)
            and role_payload
            and role_payload[0].get("access_blocked") is True
        )
        auth_status, auth_payload = request(
            f"{SUPABASE_URL}/auth/v1/admin/users/"
            f"{urllib.parse.quote(student_id)}",
            headers=service_headers,
        )
        banned_until = (
            auth_payload.get("banned_until")
            if isinstance(auth_payload, dict)
            else None
        )
        report["student_blocked_in_auth"] = (
            auth_status == 200 and bool(banned_until)
        )

        unblock_status, unblock_payload = invoke(
            anon,
            admin_access,
            {
                "action": "update_role",
                "target_user_id": student_id,
                "new_role": "student",
                "new_access_blocked": False,
            },
        )
        report["student_unblock_request_ok"] = (
            unblock_status == 200
            and isinstance(unblock_payload, dict)
            and unblock_payload.get("success") is True
        )
        role_status, role_payload = request(
            f"{SUPABASE_URL}/rest/v1/user_roles"
            f"?user_id=eq.{urllib.parse.quote(student_id)}"
            "&select=access_blocked",
            headers=service_headers,
        )
        report["student_unblocked_in_role"] = (
            role_status == 200
            and isinstance(role_payload, list)
            and role_payload
            and role_payload[0].get("access_blocked") is False
        )
        auth_status, auth_payload = request(
            f"{SUPABASE_URL}/auth/v1/admin/users/"
            f"{urllib.parse.quote(student_id)}",
            headers=service_headers,
        )
        report["student_unblocked_in_auth"] = (
            auth_status == 200
            and isinstance(auth_payload, dict)
            and not auth_payload.get("banned_until")
        )

        protected_status, _ = invoke(
            anon,
            admin_access,
            {
                "action": "delete_user",
                "target_user_id": protected_admin_id,
            },
        )
        report["admin_cannot_delete_admin"] = protected_status == 403

        delete_status, delete_payload = invoke(
            anon,
            admin_access,
            {
                "action": "delete_user",
                "target_user_id": delete_id,
            },
        )
        report["student_delete_request_ok"] = (
            delete_status == 200
            and isinstance(delete_payload, dict)
            and delete_payload.get("success") is True
        )
        deleted_auth_status, _ = request(
            f"{SUPABASE_URL}/auth/v1/admin/users/"
            f"{urllib.parse.quote(delete_id)}",
            headers=service_headers,
        )
        report["student_deleted_from_auth"] = deleted_auth_status == 404

        audit_status, audit_payload = request(
            f"{SUPABASE_URL}/rest/v1/lms_admin_audit_log"
            f"?actor_user_id=eq.{urllib.parse.quote(admin_id)}"
            "&action=eq.admin_manage_user%3Adelete_user"
            "&select=target_user_id,details"
            "&order=created_at.desc&limit=10",
            headers=service_headers,
        )
        report["delete_audit_recorded"] = (
            audit_status == 200
            and isinstance(audit_payload, list)
            and any(
                row.get("target_user_id") is None
                and isinstance(row.get("details"), dict)
                and row["details"].get("deleted_user_id") == delete_id
                for row in audit_payload
            )
        )
    finally:
        cleanup_ok = True
        for user_id in reversed(user_ids):
            status, _ = request(
                f"{SUPABASE_URL}/auth/v1/admin/users/"
                f"{urllib.parse.quote(user_id)}",
                method="DELETE",
                headers=service_headers,
            )
            if status not in (200, 204, 404):
                cleanup_ok = False
        report["cleanup"] = cleanup_ok

    required = [
        value
        for key, value in report.items()
        if key != "cleanup"
    ]
    report["success"] = all(required) and report["cleanup"] is True
    print(json.dumps(report, indent=2, ensure_ascii=False))
    if report["success"] is not True:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
