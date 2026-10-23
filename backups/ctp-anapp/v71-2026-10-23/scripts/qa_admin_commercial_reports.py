#!/usr/bin/env python3
"""QA autenticado da gestão de cupons e dos relatórios administrativos."""

from __future__ import annotations

import datetime as dt
import json
import os
import secrets
import subprocess
import urllib.error
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
        f"{SUPABASE_URL}/functions/v1/admin_commercial_reports",
        method="POST",
        body=body,
        headers=headers,
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
    anon_headers = {"apikey": anon}
    email = os.environ.get(
        "QA_ADMIN_EMAIL",
        "tom.queiroz+qa-admin-reports-20260807@pareto.plus",
    ).strip().lower()
    password = f"QaAdmin!{secrets.token_urlsafe(24)}9aA"
    user_id: str | None = None
    coupon_id: str | None = None
    report: dict[str, object] = {
        "guest_blocked": False,
        "admin_authenticated": False,
        "list_coupons_ok": False,
        "create_coupon_ok": False,
        "update_coupon_ok": False,
        "coupon_usage_ok": False,
        "student_report_ok": False,
        "student_report_filters_ok": False,
        "student_registration_fields_ok": False,
        "student_registration_filter_ok": False,
        "non_admin_blocked": False,
        "coupon_cleanup": False,
        "user_cleanup": False,
    }

    try:
        guest_status, _ = invoke(anon, None, {"action": "list_coupons"})
        report["guest_blocked"] = guest_status == 401

        create_status, created = request(
            f"{SUPABASE_URL}/auth/v1/admin/users",
            method="POST",
            body={
                "email": email,
                "password": password,
                "email_confirm": True,
                "user_metadata": {"full_name": "QA ADMIN RELATÓRIOS CTP"},
            },
            headers=service_headers,
        )
        if create_status != 200 or not isinstance(created, dict):
            report["create_admin_response"] = created
            return
        user_id = str(created["id"])

        now_iso = dt.datetime.now(dt.timezone.utc).isoformat()
        request(
            f"{SUPABASE_URL}/rest/v1/profiles",
            method="POST",
            body={
                "id": user_id,
                "email": email,
                "full_name": "QA ADMIN RELATÓRIOS CTP",
                "has_paid": False,
                "is_alumni": False,
                "created_at": now_iso,
                "updated_at": now_iso,
            },
            headers={**service_headers, "Prefer": "resolution=merge-duplicates"},
        )
        role_status, role_result = request(
            f"{SUPABASE_URL}/rest/v1/user_roles?user_id=eq.{user_id}",
            method="PATCH",
            body={
                "role": "admin",
                "full_name": "QA ADMIN RELATÓRIOS CTP",
                "access_blocked": False,
            },
            headers={**service_headers, "Prefer": "return=representation"},
        )
        report["admin_role_applied"] = (
            role_status == 200
            and isinstance(role_result, list)
            and bool(role_result)
            and role_result[0].get("role") == "admin"
        )
        if not report["admin_role_applied"]:
            report["admin_role_response"] = role_result
            return

        signin_status, session = request(
            f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
            method="POST",
            body={"email": email, "password": password},
            headers=anon_headers,
        )
        access = session.get("access_token") if isinstance(session, dict) else None
        report["admin_authenticated"] = signin_status == 200 and isinstance(access, str)
        if not isinstance(access, str):
            report["signin_response"] = session
            return

        list_status, list_result = invoke(anon, access, {"action": "list_coupons"})
        report["list_coupons_ok"] = (
            list_status == 200
            and isinstance(list_result, dict)
            and isinstance(list_result.get("coupons"), list)
            and isinstance(list_result.get("plans"), list)
        )
        if not report["list_coupons_ok"]:
            report["list_coupons_http"] = list_status
            report["list_coupons_response"] = list_result

        start = dt.datetime.now(dt.timezone.utc) - dt.timedelta(minutes=5)
        end = start + dt.timedelta(days=2)
        code = f"QAREPORT{secrets.token_hex(4).upper()}"
        create_coupon_status, create_coupon = invoke(
            anon,
            access,
            {
                "action": "upsert_coupon",
                "coupon": {
                    "code": code,
                    "description": "Cupom temporário de QA administrativo",
                    "final_price": 100,
                    "starts_at": start.isoformat(),
                    "ends_at": end.isoformat(),
                    "applies_to_plan_id": None,
                    "is_active": True,
                },
            },
        )
        coupon = (
            create_coupon.get("coupon")
            if isinstance(create_coupon, dict)
            else None
        )
        if isinstance(coupon, dict) and coupon.get("id"):
            coupon_id = str(coupon["id"])
        report["create_coupon_ok"] = create_coupon_status == 200 and coupon_id is not None
        if not report["create_coupon_ok"]:
            report["create_coupon_http"] = create_coupon_status
            report["create_coupon_response"] = create_coupon

        if coupon_id:
            update_status, update_result = invoke(
                anon,
                access,
                {
                    "action": "upsert_coupon",
                    "coupon": {
                        "id": coupon_id,
                        "code": code,
                        "description": "Cupom temporário atualizado",
                        "final_price": 90,
                        "starts_at": start.isoformat(),
                        "ends_at": end.isoformat(),
                        "applies_to_plan_id": None,
                        "is_active": False,
                    },
                },
            )
            report["update_coupon_ok"] = (
                update_status == 200
                and isinstance(update_result, dict)
                and isinstance(update_result.get("coupon"), dict)
                and update_result["coupon"].get("is_active") is False
            )

            usage_status, usage_result = invoke(
                anon,
                access,
                {
                    "action": "coupon_usage",
                    "coupon": {"id": coupon_id, "code": code},
                },
            )
            report["coupon_usage_ok"] = (
                usage_status == 200
                and isinstance(usage_result, dict)
                and isinstance(usage_result.get("usage"), list)
                and len(usage_result["usage"]) == 0
            )

        students_status, students_result = invoke(
            anon,
            access,
            {
                "action": "student_report",
                "filters": {
                    "student_type": "all",
                    "payment_status": "all",
                    "payment_method": "all",
                    "learning_status": "all",
                    "certification_status": "all",
                    "registration_status": "all",
                },
            },
        )
        report["student_report_ok"] = (
            students_status == 200
            and isinstance(students_result, dict)
            and isinstance(students_result.get("rows"), list)
            and isinstance(students_result.get("available_payment_methods"), list)
        )
        if not report["student_report_ok"]:
            report["student_report_http"] = students_status
            report["student_report_response"] = students_result
        student_rows = (
            students_result.get("rows")
            if isinstance(students_result, dict)
            else None
        )
        required_registration_keys = {
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
            "registration_complete",
            "missing_required_fields",
        }
        report["student_registration_fields_ok"] = (
            isinstance(student_rows, list)
            and bool(student_rows)
            and all(
                isinstance(row, dict)
                and required_registration_keys.issubset(row.keys())
                for row in student_rows
            )
        )

        registration_status, registration_result = invoke(
            anon,
            access,
            {
                "action": "student_report",
                "filters": {
                    "student_type": "all",
                    "learning_status": "all",
                    "payment_status": "all",
                    "payment_method": "all",
                    "certification_status": "all",
                    "registration_status": "incomplete",
                },
            },
        )
        registration_rows = (
            registration_result.get("rows")
            if isinstance(registration_result, dict)
            else None
        )
        report["student_registration_filter_ok"] = (
            registration_status == 200
            and isinstance(registration_rows, list)
            and all(
                isinstance(row, dict)
                and row.get("registration_complete") is False
                for row in registration_rows
            )
        )

        filtered_status, filtered_result = invoke(
            anon,
            access,
            {
                "action": "student_report",
                "filters": {
                    "student_type": "alumni",
                    "learning_status": "pending",
                    "payment_status": "all",
                    "payment_method": "all",
                    "certification_status": "all",
                    "registration_status": "all",
                },
            },
        )
        filtered_rows = (
            filtered_result.get("rows")
            if isinstance(filtered_result, dict)
            else None
        )
        report["student_report_filters_ok"] = (
            filtered_status == 200
            and isinstance(filtered_rows, list)
            and all(
                isinstance(row, dict)
                and row.get("student_type") == "alumni"
                and row.get("learning_status") == "pending"
                for row in filtered_rows
            )
        )

        request(
            f"{SUPABASE_URL}/rest/v1/user_roles?user_id=eq.{user_id}",
            method="PATCH",
            body={"role": "student"},
            headers=service_headers,
        )
        blocked_status, _ = invoke(anon, access, {"action": "list_coupons"})
        report["non_admin_blocked"] = blocked_status == 403
    finally:
        if coupon_id:
            request(
                f"{SUPABASE_URL}/rest/v1/payment_coupons?id=eq.{coupon_id}",
                method="DELETE",
                headers=service_headers,
            )
            status, rows = request(
                f"{SUPABASE_URL}/rest/v1/payment_coupons?id=eq.{coupon_id}&select=id",
                headers=service_headers,
            )
            report["coupon_cleanup"] = status == 200 and rows == []
        if user_id:
            request(
                f"{SUPABASE_URL}/rest/v1/lms_admin_audit_log"
                f"?actor_user_id=eq.{user_id}",
                method="DELETE",
                headers=service_headers,
            )
            request(
                f"{SUPABASE_URL}/auth/v1/admin/users/{user_id}",
                method="DELETE",
                headers=service_headers,
            )
            status, deleted = request(
                f"{SUPABASE_URL}/auth/v1/admin/users/{user_id}",
                headers=service_headers,
            )
            report["user_cleanup"] = status == 404 or deleted is None
        print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
