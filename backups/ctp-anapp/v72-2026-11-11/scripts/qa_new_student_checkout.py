#!/usr/bin/env python3
"""Live new-student and checkout QA with a disposable Supabase user."""

from __future__ import annotations

import json
import os
import secrets
import subprocess
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid

PROJECT_REF = "egihufoowzfykieozusr"
SUPABASE_URL = f"https://{PROJECT_REF}.supabase.co"
SITE_ORIGIN = "https://ctp-anapp-3.skywork.website"


def request(
    url: str,
    *,
    method: str = "GET",
    body: object | None = None,
    headers: dict[str, str] | None = None,
) -> tuple[int, object | None, dict[str, str]]:
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
            parsed = json.loads(raw) if raw else None
            return response.status, parsed, dict(response.headers.items())
    except urllib.error.HTTPError as error:
        raw = error.read().decode("utf-8", errors="replace")
        try:
            parsed = json.loads(raw) if raw else None
        except json.JSONDecodeError:
            parsed = {"raw": raw[:500]}
        return error.code, parsed, dict(error.headers.items())


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


def find_user(email: str, service_headers: dict[str, str]) -> dict[str, object] | None:
    for page in range(1, 11):
        status, payload, _ = request(
            f"{SUPABASE_URL}/auth/v1/admin/users?page={page}&per_page=1000",
            headers=service_headers,
        )
        if status != 200 or not isinstance(payload, dict):
            return None
        users = payload.get("users")
        if not isinstance(users, list):
            return None
        for user in users:
            if (
                isinstance(user, dict)
                and str(user.get("email", "")).strip().lower() == email
            ):
                return user
        if len(users) < 1000:
            break
    return None


def scalar_setting(rows: object, key: str) -> str | None:
    if not isinstance(rows, list):
        return None
    for row in rows:
        if isinstance(row, dict) and row.get("key") == key:
            value = row.get("value")
            return None if value is None else str(value)
    return None


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
    email = os.environ.get("QA_EMAIL", "").strip().lower()
    if not email:
        raise SystemExit(
            "QA_EMAIL ausente. Informe um endereço real autorizado; "
            "domínios descartáveis não são permitidos."
        )
    password = f"Qa!{secrets.token_urlsafe(24)}9aA"
    user_id: str | None = None

    report: dict[str, object] = {
        "site_origin": SITE_ORIGIN,
        "registration_http": None,
        "registration_success": False,
        "registration_cors_origin": None,
        "user_created": False,
        "email_provider_accepted": False,
        "initial_email_confirmed": None,
        "email_confirmation_applied": False,
        "signin_http": None,
        "authenticated": False,
        "alumni_check_http": None,
        "alumni_granted": None,
        "enrollment_status": None,
        "can_access_chapter_zero": False,
        "can_access_paid_content": None,
        "visible_chapters": [],
        "course_plans_count": 0,
        "commercial_prices_valid": False,
        "commercial_installments_valid": False,
        "coupon_validation": [],
        "installment_validation": {},
        "payment_configuration_http": None,
        "payment_enabled": None,
        "payment_configured": None,
        "pricing_mode_valid": None,
        "environment": None,
        "environment_matches": None,
        "pv_matches": None,
        "settings": {},
        "cleanup": False,
    }

    try:
        registration_status, registration, registration_headers = request(
            f"{SUPABASE_URL}/functions/v1/student_registration",
            method="POST",
            body={
                "action": "register",
                "email": email,
                "password": password,
                "full_name": "QA NOVO ALUNO CTP ANAPP",
            },
            headers={**anon_headers, "Origin": SITE_ORIGIN},
        )
        report["registration_http"] = registration_status
        report["registration_success"] = (
            isinstance(registration, dict) and registration.get("success") is True
        )
        report["email_provider_accepted"] = report["registration_success"]
        report["registration_cors_origin"] = registration_headers.get(
            "Access-Control-Allow-Origin"
        )

        user = find_user(email, service_headers)
        report["user_created"] = user is not None
        if not user:
            report["registration_response"] = registration
            return

        user_id = str(user["id"])
        report["initial_email_confirmed"] = bool(user.get("email_confirmed_at"))
        confirm_status, confirmed, _ = request(
            f"{SUPABASE_URL}/auth/v1/admin/users/{user_id}",
            method="PUT",
            body={"email_confirm": True},
            headers=service_headers,
        )
        report["email_confirmation_applied"] = (
            confirm_status == 200
            and isinstance(confirmed, dict)
            and confirmed.get("email_confirmed_at") is not None
        )

        signin_status, session, _ = request(
            f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
            method="POST",
            body={"email": email, "password": password},
            headers=anon_headers,
        )
        report["signin_http"] = signin_status
        access = session.get("access_token") if isinstance(session, dict) else None
        report["authenticated"] = signin_status == 200 and isinstance(access, str)
        if not isinstance(access, str):
            report["signin_response"] = session
            return

        user_headers = {"apikey": anon, "Authorization": f"Bearer {access}"}
        alumni_status, alumni_result, _ = request(
            f"{SUPABASE_URL}/functions/v1/alumni_check_on_signup",
            method="POST",
            body={},
            headers={**user_headers, "Origin": SITE_ORIGIN},
        )
        report["alumni_check_http"] = alumni_status
        if isinstance(alumni_result, dict):
            report["alumni_granted"] = bool(
                alumni_result.get("is_alumni")
                or alumni_result.get("granted")
                or alumni_result.get("access_granted")
            )

        access_status, access_context, _ = request(
            f"{SUPABASE_URL}/rest/v1/rpc/lms_access_context",
            method="POST",
            body={},
            headers=user_headers,
        )
        if access_status == 200 and isinstance(access_context, dict):
            report["enrollment_status"] = access_context.get("enrollment_status")
            report["can_access_chapter_zero"] = bool(
                access_context.get("can_access_chapter_zero")
            )
            report["can_access_paid_content"] = bool(
                access_context.get("can_access_paid_content")
            )
        else:
            report["access_context_response"] = access_context

        _, enrollment_rows, _ = request(
            f"{SUPABASE_URL}/rest/v1/student_enrollments"
            f"?select=status,email_confirmed_at,activated_at&user_id=eq.{user_id}",
            headers=service_headers,
        )
        if isinstance(enrollment_rows, list) and enrollment_rows:
            report["enrollment_row"] = enrollment_rows[0]

        _, chapters, _ = request(
            f"{SUPABASE_URL}/rest/v1/chapters"
            "?select=id,chapter_number,title&order=chapter_number.asc",
            headers=user_headers,
        )
        if isinstance(chapters, list):
            report["visible_chapters"] = [
                {
                    "chapter_number": row.get("chapter_number"),
                    "title": row.get("title"),
                }
                for row in chapters
                if isinstance(row, dict)
            ]

        _, plans, _ = request(
            f"{SUPABASE_URL}/rest/v1/course_plans"
            "?select=id,name,price,max_installments,is_active&is_active=eq.true",
            headers=user_headers,
        )
        if isinstance(plans, list):
            report["course_plans_count"] = len(plans)
            expected_prices = {
                "6e18e621-f7ae-40bd-ad25-3818eaa51ba8": 600.0,
                "32fde0de-2cc7-4ca3-bc99-cd2062d89804": 299.0,
            }
            report["commercial_prices_valid"] = (
                len(plans) == len(expected_prices)
                and all(
                    isinstance(row, dict)
                    and str(row.get("id")) in expected_prices
                    and float(row.get("price", 0))
                    == expected_prices[str(row.get("id"))]
                    for row in plans
                )
            )
            report["commercial_installments_valid"] = (
                len(plans) == len(expected_prices)
                and all(
                    isinstance(row, dict)
                    and str(row.get("id")) in expected_prices
                    and int(row.get("max_installments", 0)) == 6
                    for row in plans
                )
            )
            report["course_plans"] = [
                {
                    "name": row.get("name"),
                    "database_price": row.get("price"),
                    "max_installments": row.get("max_installments"),
                }
                for row in plans
                if isinstance(row, dict)
            ]
            coupon_validation: list[dict[str, object]] = []
            for row in plans:
                if not isinstance(row, dict) or not row.get("id"):
                    continue
                coupon_status, coupon_result, _ = request(
                    f"{SUPABASE_URL}/functions/v1/rede_charge",
                    method="POST",
                    body={
                        "action": "validate_coupon",
                        "plan_id": row["id"],
                        "coupon_code": "expolazer2026",
                    },
                    headers={**user_headers, "Origin": SITE_ORIGIN},
                )
                coupon_validation.append(
                    {
                        "plan_name": row.get("name"),
                        "http": coupon_status,
                        "expected_valid": (
                            str(row.get("id"))
                            == "32fde0de-2cc7-4ca3-bc99-cd2062d89804"
                        ),
                        "valid": (
                            isinstance(coupon_result, dict)
                            and coupon_result.get("valid") is True
                        ),
                        "normalized_code": (
                            coupon_result.get("coupon_code")
                            if isinstance(coupon_result, dict)
                            else None
                        ),
                        "final_amount": (
                            coupon_result.get("final_amount")
                            if isinstance(coupon_result, dict)
                            else None
                        ),
                        "message": (
                            coupon_result.get("message")
                            if isinstance(coupon_result, dict)
                            else None
                        ),
                    }
                )
            report["coupon_validation"] = coupon_validation

            complete_plan_id = "6e18e621-f7ae-40bd-ad25-3818eaa51ba8"
            associated_plan_id = "32fde0de-2cc7-4ca3-bc99-cd2062d89804"
            seven_status, seven_result, _ = request(
                f"{SUPABASE_URL}/functions/v1/rede_charge",
                method="POST",
                body={
                    "action": "charge",
                    "plan_id": complete_plan_id,
                    "installments": 7,
                    "idempotency_key": str(uuid.uuid4()),
                    "payment_method": "credit_card",
                },
                headers={**user_headers, "Origin": SITE_ORIGIN},
            )
            coupon_two_status, coupon_two_result, _ = request(
                f"{SUPABASE_URL}/functions/v1/rede_charge",
                method="POST",
                body={
                    "action": "charge",
                    "plan_id": associated_plan_id,
                    "installments": 2,
                    "idempotency_key": str(uuid.uuid4()),
                    "payment_method": "credit_card",
                    "coupon_code": "EXPOLAZER2026",
                },
                headers={**user_headers, "Origin": SITE_ORIGIN},
            )
            report["installment_validation"] = {
                "seven_installments_http": seven_status,
                "seven_installments_rejected": seven_status == 400,
                "seven_installments_response": seven_result,
                "coupon_two_installments_http": coupon_two_status,
                "coupon_two_installments_rejected": coupon_two_status == 400,
                "coupon_two_installments_response": coupon_two_result,
            }

        config_status, configuration, _ = request(
            f"{SUPABASE_URL}/functions/v1/rede_charge",
            method="POST",
            body={"action": "configuration"},
            headers={**user_headers, "Origin": SITE_ORIGIN},
        )
        report["payment_configuration_http"] = config_status
        if isinstance(configuration, dict):
            report["payment_enabled"] = configuration.get("enabled")
            report["payment_configured"] = configuration.get("configured")
            report["pricing_mode_valid"] = configuration.get(
                "pricing_mode_valid"
            )
            report["environment"] = configuration.get("environment")
            report["environment_matches"] = configuration.get(
                "environment_matches"
            )
            report["pv_matches"] = configuration.get("pv_matches")
            if configuration.get("success") is not True:
                report["payment_configuration_response"] = configuration

        _, settings, _ = request(
            f"{SUPABASE_URL}/rest/v1/system_settings"
            "?select=key,value&key=in."
            "(erede_enabled,erede_environment,erede_pv,"
            "erede_public_checkout_mode)",
            headers=service_headers,
        )
        report["settings"] = {
            "erede_enabled": scalar_setting(settings, "erede_enabled"),
            "erede_environment": scalar_setting(settings, "erede_environment"),
            "erede_pv_present": bool(scalar_setting(settings, "erede_pv")),
            "erede_public_checkout_mode": scalar_setting(
                settings, "erede_public_checkout_mode"
            ),
        }
    finally:
        if user_id:
            request(
                f"{SUPABASE_URL}/auth/v1/admin/users/{user_id}",
                method="DELETE",
                headers=service_headers,
            )
        report["cleanup"] = find_user(email, service_headers) is None
        print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
