"""
Phase 5 — Financial Invoicing & Escrow Commission Splits API
Routes:
  POST   /invoices          — Generate commercial invoice
  GET    /invoices/my       — List user's invoices (talent, client, or agency)
  GET    /invoices/{id}     — View detailed invoice breakdown
  PATCH  /invoices/{id}/pay — Mark escrow funded or disbursed
"""
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.security import get_current_user
from app.models.logistics import Invoice
from app.models.model_profile import ModelProfile
from app.models.booking import BookingOffer
from app.models.user import User, UserRole

router = APIRouter(prefix="/invoices", tags=["Financial Invoices"])


class InvoiceCreate(BaseModel):
    model_username: str
    booking_offer_id: Optional[int] = None
    project_title: str
    gross_amount: float
    currency: str = "INR"
    agency_fee_percentage: float = 20.0
    tax_percentage: float = 18.0 # Standard 18% GST / commercial tax
    due_date: Optional[str] = None


class InvoicePaymentUpdate(BaseModel):
    payment_status: str # in_escrow, paid, cancelled
    payment_method: Optional[str] = "Escrow Wire Transfer"


def invoice_to_dict(inv: Invoice) -> dict:
    mp = inv.model_profile
    return {
        "id": inv.id,
        "invoice_number": inv.invoice_number,
        "booking_offer_id": inv.booking_offer_id,
        "project_title": inv.project_title,
        "currency": inv.currency,
        "gross_amount": inv.gross_amount,
        "agency_fee_percentage": inv.agency_fee_percentage,
        "agency_fee_amount": inv.agency_fee_amount,
        "net_talent_amount": inv.net_talent_amount,
        "tax_amount": inv.tax_amount,
        "total_amount": inv.total_amount,
        "payment_status": inv.payment_status,
        "due_date": inv.due_date,
        "paid_at": inv.paid_at.isoformat() if inv.paid_at else None,
        "payment_method": inv.payment_method,
        "client": {
            "id": inv.client.id,
            "email": inv.client.email,
        } if inv.client else None,
        "model": {
            "id": mp.id,
            "username": mp.username,
            "full_name": mp.full_name,
            "agency_name": mp.agency_name,
        } if mp else None,
        "created_at": inv.created_at.isoformat() if inv.created_at else None,
    }


@router.post("", status_code=status.HTTP_201_CREATED, summary="Create an invoice")
def create_invoice(
    payload: InvoiceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    mp = db.query(ModelProfile).filter(ModelProfile.username == payload.model_username).first()
    if not mp:
        raise HTTPException(status_code=404, detail="Model profile not found")

    # Generate sequential unique invoice number
    inv_count = db.query(Invoice).count() + 1
    inv_number = f"CMID-INV-2026-{inv_count:05d}"

    # Calculate agency commission and tax breakdown
    gross = payload.gross_amount
    agency_pct = payload.agency_fee_percentage
    agency_fee = round(gross * (agency_pct / 100.0), 2)
    net_talent = round(gross - agency_fee, 2)
    tax_amt = round(gross * (payload.tax_percentage / 100.0), 2)
    total = round(gross + tax_amt, 2)

    inv = Invoice(
        invoice_number=inv_number,
        booking_offer_id=payload.booking_offer_id,
        client_id=current_user.id,
        model_profile_id=mp.id,
        project_title=payload.project_title,
        currency=payload.currency,
        gross_amount=gross,
        agency_fee_percentage=agency_pct,
        agency_fee_amount=agency_fee,
        net_talent_amount=net_talent,
        tax_amount=tax_amt,
        total_amount=total,
        payment_status="issued",
        due_date=payload.due_date,
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return invoice_to_dict(inv)


@router.get("/my", summary="List current user's financial invoices")
def list_my_invoices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_model = db.query(ModelProfile).filter(ModelProfile.user_id == current_user.id).first()

    q = db.query(Invoice)
    if user_model:
        q = q.filter(
            (Invoice.model_profile_id == user_model.id) | (Invoice.client_id == current_user.id)
        )
    else:
        q = q.filter(Invoice.client_id == current_user.id)

    invoices = q.order_by(Invoice.created_at.desc()).all()
    return [invoice_to_dict(inv) for inv in invoices]


@router.get("/{invoice_id}", summary="Get detailed invoice breakdown")
def get_invoice(
    invoice_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    user_model = db.query(ModelProfile).filter(ModelProfile.user_id == current_user.id).first()
    is_client = inv.client_id == current_user.id
    is_talent = user_model and inv.model_profile_id == user_model.id
    is_admin = current_user.role == UserRole.ADMIN.value

    if not (is_client or is_talent or is_admin):
        raise HTTPException(status_code=403, detail="Not authorized to view this invoice")

    return invoice_to_dict(inv)


@router.patch("/{invoice_id}/pay", summary="Fund escrow or mark invoice paid")
def update_payment(
    invoice_id: int,
    payload: InvoicePaymentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    inv.payment_status = payload.payment_status
    if payload.payment_method:
        inv.payment_method = payload.payment_method

    if payload.payment_status == "paid":
        inv.paid_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(inv)
    return invoice_to_dict(inv)
