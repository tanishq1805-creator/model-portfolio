from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.models.model_profile import (
    ModelProfile,
    ModelMeasurements,
    ModelPortfolioItem,
    ModelExperience,
    ModelSocialLinks,
    ModelAchievement,
    ModelReview,
    VerificationRequest,
)
from app.security import get_password_hash

MODELS_SEED = [
    {
        "email": "elena.rostova@modelhub.test",
        "username": "elenarostova",
        "full_name": "Elena Rostova",
        "profile_photo": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
        "cover_image": "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=80",
        "bio": "International high-fashion and runway model with 6 years of European fashion week experience. Known for architectural posture and editorial versatility.",
        "gender": "Female",
        "city": "Paris",
        "country": "France",
        "location": "Paris / Milan",
        "model_type": "Runway, High Fashion, Editorial",
        "experience_level": "Expert",
        "height_cm": 179.0,
        "height_feet_inches": "5'10.5\"",
        "shoe_size": "39 EU",
        "hair_color": "Dark Blonde",
        "eye_color": "Green",
        "languages": "English, French, Russian",
        "skills": "Runway Stride, Haute Couture Posing, Film Acting, Editorial Movement",
        "agency_status": "represented",
        "agency_name": "Elite Paris Representation",
        "availability_status": "available",
        "is_identity_verified": True,
        "is_portfolio_verified": True,
        "is_measurements_verified": True,
        "is_agency_verified": True,
        "measurements": {"bust": 33.0, "waist": 24.0, "hips": 35.0, "inseam": 34.0, "visibility": "public"},
        "portfolio": [
            {"media_url": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80", "category": "Editorial", "caption": "Vogue Paris Winter Edition"},
            {"media_url": "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80", "category": "Runway", "caption": "Milan Fashion Week SS26 Opening"},
            {"media_url": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80", "category": "Campaigns", "caption": "Maison Noir Global Campaign"},
            {"media_url": "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80", "category": "Beauty", "caption": "L'Étoile Beauty Campaign"}
        ],
        "experiences": [
            {"company_or_brand": "Chanel Haute Couture", "campaign_title": "Autumn/Winter Paris Runway", "role_title": "Lead Runway Model", "year": "2026", "location": "Grand Palais, Paris"},
            {"company_or_brand": "Saint Laurent", "campaign_title": "Global Summer Editorial", "role_title": "Campaign Talent", "year": "2025", "location": "Morocco"}
        ]
    },
    {
        "email": "aarav.mehta@modelhub.test",
        "username": "aaravmehta",
        "full_name": "Aarav Mehta",
        "profile_photo": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
        "cover_image": "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=1600&q=80",
        "bio": "Mumbai-based commercial & menswear editorial model. Extensive experience in luxury suiting, lifestyle apparel, and national prime-time television campaigns.",
        "gender": "Male",
        "city": "Mumbai",
        "country": "India",
        "location": "Mumbai, India",
        "model_type": "Commercial, Fashion, Lifestyle",
        "experience_level": "Professional",
        "height_cm": 186.0,
        "height_feet_inches": "6'1\"",
        "shoe_size": "43 EU / 10 UK",
        "hair_color": "Black",
        "eye_color": "Dark Brown",
        "languages": "English, Hindi, Gujarati",
        "skills": "Tailored Menswear, Cinematic Expression, Fitness Movement, Voiceover",
        "agency_status": "independent",
        "agency_name": "",
        "availability_status": "available",
        "is_identity_verified": True,
        "is_portfolio_verified": True,
        "is_measurements_verified": True,
        "is_agency_verified": False,
        "measurements": {"chest": 40.0, "waist": 31.0, "collar": 15.5, "inseam": 32.5, "suit_jacket": "40R", "visibility": "public"},
        "portfolio": [
            {"media_url": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80", "category": "Commercial", "caption": "Bespoke Suiting Collection"},
            {"media_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80", "category": "Lifestyle", "caption": "Urban Heritage Lookbook"}
        ],
        "experiences": [
            {"company_or_brand": "Raymond Bespoke", "campaign_title": "The Modern Gentleman", "role_title": "Principal Face", "year": "2026", "location": "Mumbai"},
            {"company_or_brand": "GQ India", "campaign_title": "Autumn Editorial Spread", "role_title": "Feature Model", "year": "2025", "location": "Delhi"}
        ]
    },
    {
        "email": "ananya.sen@modelhub.test",
        "username": "ananyasen",
        "full_name": "Ananya Sen",
        "profile_photo": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
        "cover_image": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=80",
        "bio": "High fashion & traditional couture runway model. Regular presence at Lakmé Fashion Week and FDCI India Couture Week.",
        "gender": "Female",
        "city": "Delhi",
        "country": "India",
        "location": "Delhi / Mumbai",
        "model_type": "Fashion, Runway, Jewellery",
        "experience_level": "Professional",
        "height_cm": 178.0,
        "height_feet_inches": "5'10\"",
        "shoe_size": "38 EU",
        "hair_color": "Dark Brown",
        "eye_color": "Brown",
        "languages": "English, Hindi, Bengali",
        "skills": "Heritage Drapes, Runway Stride, Heavy Jewellery Posing, Editorial Close-ups",
        "agency_status": "represented",
        "agency_name": "Inez Talent Management",
        "availability_status": "available",
        "is_identity_verified": True,
        "is_portfolio_verified": True,
        "is_measurements_verified": True,
        "is_agency_verified": True,
        "measurements": {"bust": 32.5, "waist": 24.5, "hips": 35.0, "visibility": "public"},
        "portfolio": [
            {"media_url": "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80", "category": "Jewellery", "caption": "Royal Heritage Gold Collection"},
            {"media_url": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=900&q=80", "category": "Editorial", "caption": "Harper's Bazaar India Editorial"}
        ],
        "experiences": [
            {"company_or_brand": "Sabyasachi Heritage", "campaign_title": "Couture Spring/Summer", "role_title": "Campaign Model", "year": "2026", "location": "Kolkata"},
            {"company_or_brand": "Lakmé Fashion Week", "campaign_title": "Grand Finale Runway", "role_title": "Runway Model", "year": "2025", "location": "Mumbai"}
        ]
    },
    {
        "email": "kai.tanaka@modelhub.test",
        "username": "kaitanaka",
        "full_name": "Kai Tanaka",
        "profile_photo": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
        "cover_image": "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=1600&q=80",
        "bio": "Tokyo-born avant-garde streetwear & editorial model. Working across Tokyo, London, and New York for modernist independent designers.",
        "gender": "Male",
        "city": "Tokyo",
        "country": "Japan",
        "location": "Tokyo / London",
        "model_type": "Editorial, Streetwear, Product",
        "experience_level": "Professional",
        "height_cm": 184.0,
        "height_feet_inches": "6'0.5\"",
        "shoe_size": "42.5 EU",
        "hair_color": "Black",
        "eye_color": "Obsidian",
        "languages": "Japanese, English",
        "skills": "Minimalist Expression, Contemporary Movement, Techwear Styling",
        "agency_status": "represented",
        "agency_name": "Bravo Tokyo Agency",
        "availability_status": "available",
        "is_identity_verified": True,
        "is_portfolio_verified": True,
        "is_measurements_verified": True,
        "is_agency_verified": True,
        "measurements": {"chest": 38.0, "waist": 29.5, "inseam": 32.0, "visibility": "public"},
        "portfolio": [
            {"media_url": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80", "category": "Editorial", "caption": "Neo-Tokyo Monolith Shoot"}
        ],
        "experiences": [
            {"company_or_brand": "Issey Miyake Homme", "campaign_title": "Sculptural Series", "role_title": "Editorial Face", "year": "2026", "location": "Tokyo"}
        ]
    },
    {
        "email": "sofia.castillo@modelhub.test",
        "username": "sofiacastillo",
        "full_name": "Sofia Castillo",
        "profile_photo": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
        "cover_image": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
        "bio": "Commercial, fitness, and beauty specialist with over 8 years in the global market. Energized, disciplined, and seasoned collaborator for premium athletic labels.",
        "gender": "Female",
        "city": "Barcelona",
        "country": "Spain",
        "location": "Barcelona / London",
        "model_type": "Beauty, Fitness, Commercial",
        "experience_level": "Expert",
        "height_cm": 175.0,
        "height_feet_inches": "5'9\"",
        "shoe_size": "38.5 EU",
        "hair_color": "Chestnut",
        "eye_color": "Hazel",
        "languages": "Spanish, English, Catalan",
        "skills": "High-Impact Athletic Motion, Skincare Close-ups, Underwater Posing",
        "agency_status": "independent",
        "agency_name": "",
        "availability_status": "partially_available",
        "is_identity_verified": True,
        "is_portfolio_verified": True,
        "is_measurements_verified": True,
        "is_agency_verified": False,
        "measurements": {"bust": 34.0, "waist": 25.0, "hips": 36.0, "visibility": "public"},
        "portfolio": [
            {"media_url": "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80", "category": "Fitness", "caption": "Apex Athletic Performance Line"},
            {"media_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80", "category": "Beauty", "caption": "Solar Radiant Skincare"}
        ],
        "experiences": [
            {"company_or_brand": "Nike Women EMEA", "campaign_title": "Move Without Limit", "role_title": "Feature Athlete Model", "year": "2026", "location": "Barcelona"}
        ]
    },
    {
        "email": "zara.al-mansoor@modelhub.test",
        "username": "zaramansoor",
        "full_name": "Zara Al-Mansoor",
        "profile_photo": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
        "cover_image": "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=80",
        "bio": "Dubai-based luxury jewellery and high-end beauty model. Renowned for expressive eyes and delicate jewellery presentation.",
        "gender": "Female",
        "city": "Dubai",
        "country": "United Arab Emirates",
        "location": "Dubai / Mumbai",
        "model_type": "Jewellery, Beauty, High Fashion",
        "experience_level": "Professional",
        "height_cm": 176.0,
        "height_feet_inches": "5'9.5\"",
        "shoe_size": "38 EU",
        "hair_color": "Raven Black",
        "eye_color": "Dark Brown",
        "languages": "Arabic, English, French",
        "skills": "High Jewellery Presentation, Micro Posing, Luxury Editorial",
        "agency_status": "represented",
        "agency_name": "Avant Dubai Models",
        "availability_status": "available",
        "is_identity_verified": True,
        "is_portfolio_verified": True,
        "is_measurements_verified": True,
        "is_agency_verified": True,
        "measurements": {"bust": 33.0, "waist": 24.0, "hips": 35.0, "visibility": "public"},
        "portfolio": [
            {"media_url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80", "category": "Jewellery", "caption": "Cartier High Jewellery Showcase"}
        ],
        "experiences": [
            {"company_or_brand": "Bulgari High Jewellery", "campaign_title": "Mediterranean Reverie", "role_title": "Lead Face", "year": "2026", "location": "Dubai"}
        ]
    }
]

DEMO_ACCOUNTS = [
    {"email": "model@modelhub.com", "password": "password123", "role": UserRole.MODEL.value, "username": "modelhub_talent", "name": "Siddharth Varma"},
    {"email": "brand@modelhub.com", "password": "password123", "role": UserRole.BRAND.value},
    {"email": "agency@modelhub.com", "password": "password123", "role": UserRole.AGENCY.value},
    {"email": "photographer@modelhub.com", "password": "password123", "role": UserRole.PHOTOGRAPHER.value},
    {"email": "casting@modelhub.com", "password": "password123", "role": UserRole.CASTING_DIRECTOR.value},
    {"email": "admin@modelhub.com", "password": "password123", "role": UserRole.ADMIN.value},
]

def seed_initial_data(db: Session):
    seed_phase3_data(db)  # Phase 3 seeding (castings, messaging)
    seed_phase4_data(db)  # Phase 4 seeding (agencies, bookings, shortlists)
    seed_phase5_data(db)  # Phase 5 seeding (call sheets, calendar holds, invoices)
    seed_phase6_data(db)  # Phase 6 seeding (in-app notifications & demo data)
    # Check if demo model exists
    demo_user = db.query(User).filter(User.email == "model@modelhub.com").first()
    if not demo_user:
        for acc in DEMO_ACCOUNTS:
            u = User(
                email=acc["email"],
                hashed_password=get_password_hash(acc["password"]),
                role=acc["role"],
                is_active=True,
                is_verified=True,
            )
            db.add(u)
            db.commit()

            db.refresh(u)

            if acc["role"] == UserRole.MODEL.value:
                p = ModelProfile(
                    user_id=u.id,
                    username=acc["username"],
                    full_name=acc["name"],
                    profile_photo="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
                    cover_image="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=80",
                    bio="Editorial and high-fashion talent. Passionate about structured silhouettes, avant-garde concepts, and sustainable fashion campaigns.",
                    gender="Male",
                    city="Mumbai",
                    country="India",
                    location="Mumbai, India",
                    model_type="Fashion, Runway, Editorial",
                    experience_level="Professional",
                    height_cm=185.0,
                    height_feet_inches="6'1\"",
                    shoe_size="43 EU",
                    hair_color="Dark Brown",
                    eye_color="Brown",
                    languages="English, Hindi",
                    skills="Runway, High Fashion Posing, Commercial Acting",
                    agency_status="represented",
                    agency_name="Vogue India Management",
                    availability_status="available",
                    profile_completion_percentage=94,
                    onboarding_completed=True,
                    is_identity_verified=True,
                    is_portfolio_verified=True,
                    is_measurements_verified=True,
                    is_agency_verified=True,
                )
                db.add(p)
                db.commit()

                db.refresh(p)

                m = ModelMeasurements(model_profile_id=p.id, chest=39.0, waist=30.0, inseam=33.0, collar=15.5, suit_jacket="39R", visibility="public")
                s = ModelSocialLinks(model_profile_id=p.id, instagram="siddharthvarma", linkedin="siddharth-varma-model", website="https://siddharthvarma.com")
                db.add(m)
                db.add(s)

                item1 = ModelPortfolioItem(model_profile_id=p.id, media_url="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80", category="Editorial", caption="Autumn Winter Runway", is_cover=True, display_order=0)
                item2 = ModelPortfolioItem(model_profile_id=p.id, media_url="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80", category="Commercial", caption="Luxury Tailoring Campaign", is_cover=False, display_order=1)
                db.add(item1)
                db.add(item2)

                exp = ModelExperience(model_profile_id=p.id, company_or_brand="Armani Tailoring", campaign_title="Sartorial Precision", role_title="Lead Editorial Model", location="Milan", year="2026")
                db.add(exp)
                db.commit()

    # Seed the editorial model roster if not populated
    count = db.query(ModelProfile).count()
    if count < 5:
        for m_data in MODELS_SEED:
            existing_user = db.query(User).filter(User.email == m_data["email"]).first()
            if existing_user:
                continue
            u = User(
                email=m_data["email"],
                hashed_password=get_password_hash("password123"),
                role=UserRole.MODEL.value,
                is_active=True,
                is_verified=True,
            )
            db.add(u)
            db.commit()

            db.refresh(u)

            p = ModelProfile(
                user_id=u.id,
                username=m_data["username"],
                full_name=m_data["full_name"],
                profile_photo=m_data["profile_photo"],
                cover_image=m_data["cover_image"],
                bio=m_data["bio"],
                gender=m_data["gender"],
                city=m_data["city"],
                country=m_data["country"],
                location=m_data["location"],
                model_type=m_data["model_type"],
                experience_level=m_data["experience_level"],
                height_cm=m_data["height_cm"],
                height_feet_inches=m_data["height_feet_inches"],
                shoe_size=m_data["shoe_size"],
                hair_color=m_data["hair_color"],
                eye_color=m_data["eye_color"],
                languages=m_data["languages"],
                skills=m_data["skills"],
                agency_status=m_data["agency_status"],
                agency_name=m_data["agency_name"],
                availability_status=m_data["availability_status"],
                profile_completion_percentage=92,
                onboarding_completed=True,
                is_identity_verified=m_data["is_identity_verified"],
                is_portfolio_verified=m_data["is_portfolio_verified"],
                is_measurements_verified=m_data["is_measurements_verified"],
                is_agency_verified=m_data["is_agency_verified"],
            )
            db.add(p)
            db.commit()

            db.refresh(p)

            meas_dict = m_data.get("measurements", {})
            meas = ModelMeasurements(
                model_profile_id=p.id,
                bust=meas_dict.get("bust"),
                waist=meas_dict.get("waist"),
                hips=meas_dict.get("hips"),
                chest=meas_dict.get("chest"),
                collar=meas_dict.get("collar"),
                inseam=meas_dict.get("inseam"),
                suit_jacket=meas_dict.get("suit_jacket"),
                visibility=meas_dict.get("visibility", "public"),
            )
            db.add(meas)

            soc = ModelSocialLinks(
                model_profile_id=p.id,
                instagram=f"https://instagram.com/{m_data['username']}",
                website=f"https://{m_data['username']}.modelhub.me",
            )
            db.add(soc)

            for i, item in enumerate(m_data.get("portfolio", [])):
                pi = ModelPortfolioItem(
                    model_profile_id=p.id,
                    media_url=item["media_url"],
                    category=item["category"],
                    caption=item["caption"],
                    is_cover=(i == 0),
                    display_order=i,
                )
                db.add(pi)

            for exp in m_data.get("experiences", []):
                ex = ModelExperience(
                    model_profile_id=p.id,
                    company_or_brand=exp["company_or_brand"],
                    campaign_title=exp["campaign_title"],
                    role_title=exp.get("role_title", "Model"),
                    location=exp.get("location"),
                    year=exp["year"],
                )
                db.add(ex)

            db.commit()

    seed_phase2_enhancements(db)

def seed_phase2_enhancements(db: Session):
    elena = db.query(ModelProfile).filter(ModelProfile.username == "elenarostova").first()
    if elena and not elena.achievements:
        ach1 = ModelAchievement(
            model_profile_id=elena.id,
            title="Chanel Grand Palais Finale",
            organization_or_event="Chanel Haute Couture",
            year="2026",
            category="Fashion Week",
            description="Walked closing look for Spring/Summer Paris Haute Couture week.",
        )
        ach2 = ModelAchievement(
            model_profile_id=elena.id,
            title="Vogue Paris Winter Cover",
            organization_or_event="Condé Nast France",
            year="2025",
            category="Magazine Feature",
            description="Featured on front cover photographed by Marcus Vance.",
        )
        ach3 = ModelAchievement(
            model_profile_id=elena.id,
            title="Model of the Year Nominee",
            organization_or_event="European Fashion Council",
            year="2025",
            category="Award",
            description="Nominated for breakout editorial performance.",
        )
        db.add_all([ach1, ach2, ach3])

        rev1 = ModelReview(
            model_profile_id=elena.id,
            reviewer_name="Claire Dubois",
            reviewer_company="Maison De L'Ombre",
            reviewer_role="Brand",
            rating=5,
            comment="Elena exhibited unmatched poise, discipline, and architectural precision on our Paris runway set. An absolute professional to work with.",
            project_name="Paris FW26 Haute Couture",
        )
        rev2 = ModelReview(
            model_profile_id=elena.id,
            reviewer_name="Marcus Vance",
            reviewer_company="Vance Studio Paris",
            reviewer_role="Photographer",
            rating=5,
            comment="Incredible light awareness and dramatic framing. Takes creative direction effortlessly and delivers museum-quality editorial tear-sheets.",
            project_name="Vogue Winter Monolith Series",
        )
        db.add_all([rev1, rev2])
        db.commit()

    aarav = db.query(ModelProfile).filter(ModelProfile.username == "aaravmehta").first()
    if aarav and not aarav.achievements:
        ach1 = ModelAchievement(
            model_profile_id=aarav.id,
            title="Raymond Bespoke National Face",
            organization_or_event="Raymond Luxury",
            year="2026",
            category="Brand Campaign",
            description="National billboard and prime-time suiting campaign across India.",
        )
        ach2 = ModelAchievement(
            model_profile_id=aarav.id,
            title="GQ Men of the Year Showcase",
            organization_or_event="GQ Magazine",
            year="2025",
            category="Magazine Feature",
            description="Special editorial spread on modern sartorial luxury.",
        )
        db.add_all([ach1, ach2])

        rev1 = ModelReview(
            model_profile_id=aarav.id,
            reviewer_name="Vikramaditya Roy",
            reviewer_company="Apex Menswear",
            reviewer_role="Brand",
            rating=5,
            comment="Aarav is extraordinarily punctual, grounded, and commands luxury suiting like no one else. Great energy on set for 12-hour production schedules.",
            project_name="Autumn Heritage Campaign",
        )
        db.add(rev1)
        db.commit()

def seed_phase3_data(db: Session):
    """Seed Phase 3 demo data: casting calls, sample conversations."""
    from app.models.casting import CastingCall, CastingApplication
    from app.models.messaging import Conversation, Message
    from datetime import datetime, timezone

    # ── Find or create a brand user ─────────────────────────────────────────
    brand_user = db.query(User).filter(User.email == "brand.vogue@modelhub.test").first()
    if not brand_user:
        brand_user = User(
            email="brand.vogue@modelhub.test",
            hashed_password=get_password_hash("Brand@2026"),
            role="BRAND",
            is_active=True,
            is_verified=True,
        )
        db.add(brand_user)
        db.flush()

    casting_director = db.query(User).filter(User.email == "casting@modelhub.test").first()
    if not casting_director:
        casting_director = User(
            email="casting@modelhub.test",
            hashed_password=get_password_hash("Casting@2026"),
            role="CASTING_DIRECTOR",
            is_active=True,
            is_verified=True,
        )
        db.add(casting_director)
        db.flush()

    # ── Seed casting calls ───────────────────────────────────────────────────
    if db.query(CastingCall).count() == 0:
        castings = [
            CastingCall(
                poster_id=brand_user.id,
                title="Editorial Model — Winter Collection 2026",
                brand_name="Noir Élite",
                campaign_name="Winter Darkness Campaign",
                description="We are seeking a high-fashion female editorial model for our Winter 2026 luxury lookbook. Shooting in Paris over 3 days. Full travel and accommodation provided.",
                category="Editorial",
                location="Paris, France",
                gender_requirement="Female",
                min_age=20,
                max_age=32,
                min_height_cm=173.0,
                experience_level="Professional",
                skills_required="Editorial, Haute Couture Posing, Film Acting",
                compensation="€2,500 / day",
                compensation_type="paid",
                shoot_date="December 10-12, 2026",
                application_deadline="November 25, 2026",
                status="active",
                is_featured=True,
            ),
            CastingCall(
                poster_id=casting_director.id,
                title="Male Runway Model — India Fashion Week",
                brand_name="India Fashion Week",
                campaign_name="IFW Spring/Summer 2027",
                description="Seeking experienced male runway models for the upcoming India Fashion Week Spring/Summer 2027. Multiple designer shows available. Models must be available for rehearsals.",
                category="Runway",
                location="Mumbai, India",
                gender_requirement="Male",
                min_age=18,
                max_age=30,
                min_height_cm=182.0,
                experience_level="Intermediate",
                skills_required="Runway Stride, Commercial Posing",
                compensation="₹25,000 / show",
                compensation_type="paid",
                shoot_date="February 2027",
                application_deadline="December 15, 2026",
                status="active",
                is_featured=True,
            ),
            CastingCall(
                poster_id=brand_user.id,
                title="Fitness & Lifestyle Model — Health Brand Campaign",
                brand_name="PureVita Wellness",
                campaign_name="Move With Purpose 2026",
                description="Looking for fit, energetic models for our wellness and fitness brand campaign. Outdoor shoots in Goa. Open to all genders. Must be comfortable with athletic wear.",
                category="Fitness",
                location="Goa, India",
                is_remote=False,
                gender_requirement="Any",
                min_age=22,
                max_age=35,
                experience_level="Beginner",
                skills_required="Fitness, Lifestyle, Commercial Posing",
                compensation="₹15,000 / day",
                compensation_type="paid",
                shoot_date="January 15-18, 2027",
                application_deadline="December 20, 2026",
                status="active",
            ),
            CastingCall(
                poster_id=casting_director.id,
                title="Beauty Model — International Fragrance Campaign",
                brand_name="Maison Lumière",
                campaign_name="L'Étoile Noir Fragrance",
                description="International luxury fragrance house seeking a captivating female model for their new fragrance launch. Close-up beauty work, story-driven editorial.",
                category="Beauty",
                location="Milan, Italy",
                gender_requirement="Female",
                min_age=21,
                max_age=28,
                min_height_cm=170.0,
                experience_level="Professional",
                skills_required="Beauty, Editorial, Film Acting",
                compensation="€3,000 flat fee",
                compensation_type="paid",
                shoot_date="November 20, 2026",
                application_deadline="November 5, 2026",
                status="active",
                is_featured=True,
            ),
            CastingCall(
                poster_id=brand_user.id,
                title="Commercial Model — E-Commerce Fashion Shoot",
                brand_name="StyleStreet India",
                campaign_name="StyleStreet Winter Catalogue",
                description="India's leading fashion e-commerce brand is looking for models for a large-scale winter catalogue shoot in Delhi. Multiple categories — casual, formal, ethnic wear.",
                category="Commercial",
                location="Delhi, India",
                gender_requirement="Any",
                min_age=18,
                max_age=35,
                experience_level="Beginner",
                skills_required="Commercial Posing, Lifestyle",
                compensation="₹8,000 / day",
                compensation_type="paid",
                shoot_date="December 2026",
                application_deadline="November 30, 2026",
                status="active",
            ),
        ]
        for c in castings:
            db.add(c)
        db.commit()

    # ── Seed a sample conversation ───────────────────────────────────────────
    from app.models.messaging import Conversation, Message
    if db.query(Conversation).count() == 0:
        elena_user = db.query(User).filter(User.email == "elena.rostova@modelhub.test").first()
        if elena_user and brand_user:
            conv = Conversation(
                user_a_id=brand_user.id,
                user_b_id=elena_user.id,
                subject="Winter 2026 Editorial — Casting Inquiry",
                last_message_preview="We'd love to discuss the campaign details with you.",
                last_message_at=datetime.now(timezone.utc),
                user_b_unread=1,
            )
            db.add(conv)
            db.flush()
            msgs = [
                Message(conversation_id=conv.id, sender_id=brand_user.id, content="Hello Elena, we saw your portfolio on CMID MODEL HOUSE. We're casting for our Winter 2026 Noir Élite editorial in Paris. Would you be available Dec 10-12?", is_read=True),
                Message(conversation_id=conv.id, sender_id=elena_user.id, content="Thank you so much for reaching out! Paris in December sounds wonderful. I'm available those dates. Could you share the brief and compensation details?", is_read=True),
                Message(conversation_id=conv.id, sender_id=brand_user.id, content="Absolutely! The brief is attached. We're offering €2,500/day with full travel and 5-star accommodation. We'd love to discuss the campaign details with you.", is_read=False),
            ]
            for m in msgs:
                db.add(m)
            db.commit()

def seed_phase4_data(db: Session):
    """Seed Phase 4 demo data: Agencies, Direct Bookings, Shortlists."""
    from app.models.agency import AgencyProfile
    from app.models.booking import BookingOffer
    from app.models.shortlist import TalentShortlist, ShortlistItem
    from app.models.model_profile import ModelProfile
    from datetime import datetime, timezone

    # 1. Seed Agency Profiles
    agency_user = db.query(User).filter(User.email == "agency@modelhub.com").first()
    if agency_user and db.query(AgencyProfile).count() == 0:
        agencies = [
            AgencyProfile(
                user_id=agency_user.id,
                name="Elite Paris Representation",
                slug="elite-paris",
                tagline="Europe's premiere high-fashion editorial & runway agency",
                bio="Representing leading international runway faces and editorial pioneers across Paris Haute Couture, Milan, and New York Fashion Weeks.",
                headquarters="Paris, France",
                global_locations="Paris, Milan, London, New York",
                website="https://eliteparis.fashion",
                contact_email="booking@eliteparis.fashion",
                phone="+33 1 42 68 00 00",
                is_verified=True,
            ),
            AgencyProfile(
                user_id=agency_user.id,
                name="Avant Dubai Models",
                slug="avant-dubai",
                tagline="Middle East luxury & high jewellery model management",
                bio="Specializing in luxury campaigns, fine jewellery showcases, and international beauty productions across the GCC and Europe.",
                headquarters="Dubai, UAE",
                global_locations="Dubai, Abu Dhabi, Milan, Mumbai",
                website="https://avantdubai.fashion",
                contact_email="roster@avantdubai.fashion",
                phone="+971 4 360 8899",
                is_verified=True,
            ),
            AgencyProfile(
                user_id=agency_user.id,
                name="Inega Talent Management",
                slug="inega-mumbai",
                tagline="Pioneering fashion, commercial, and editorial representation in India",
                bio="Managing the country's most sought-after runway strides, luxury fashion talent, and contemporary editorial faces.",
                headquarters="Mumbai, India",
                global_locations="Mumbai, Delhi, Bangalore",
                website="https://inega.in",
                contact_email="talent@inega.in",
                phone="+91 22 2640 1200",
                is_verified=True,
            ),
        ]
        for a in agencies:
            db.add(a)
        db.commit()

    # 2. Seed Direct Booking Contract
    brand_user = db.query(User).filter(User.email == "brand@modelhub.com").first()
    elena = db.query(ModelProfile).filter(ModelProfile.username == "elenarostova").first()
    siddharth = db.query(ModelProfile).filter(ModelProfile.username == "modelhub_talent").first()

    if brand_user and elena and db.query(BookingOffer).count() == 0:
        b1 = BookingOffer(
            client_id=brand_user.id,
            model_profile_id=elena.id,
            project_title="Vogue Paris — Architectural Winter Editorial",
            client_organization="Vogue France / Condé Nast",
            project_type="Editorial",
            shoot_location="Place Vendôme, Paris",
            start_date="2026-11-18",
            end_date="2026-11-20",
            call_time="07:30 AM",
            compensation_amount=185000.0,
            currency="INR",
            rate_basis="day_rate",
            usage_rights="Print & Global Digital (2 Years)",
            cancellation_terms="Standard 48-hour client cancellation window with 50% kill-fee.",
            wardrobe_notes="Haute Couture looks provided by Chanel & Saint Laurent. Manicure and clean base required.",
            status="pending",
        )
        db.add(b1)

        if siddharth:
            b2 = BookingOffer(
                client_id=brand_user.id,
                model_profile_id=siddharth.id,
                project_title="Raymond Bespoke Autumn Suiting Lookbook",
                client_organization="Raymond Luxury",
                project_type="Commercial",
                shoot_location="Ballroom, The Taj Mahal Palace, Mumbai",
                start_date="2026-12-05",
                end_date="2026-12-06",
                call_time="08:00 AM",
                compensation_amount=95000.0,
                currency="INR",
                rate_basis="project_flat",
                usage_rights="Digital & National OOH (1 Year)",
                cancellation_terms="Full fee payable if cancelled within 24 hours of call time.",
                wardrobe_notes="Tailored suiting provided on set. Clean shave upon arrival.",
                status="accepted",
            )
            db.add(b2)

        db.commit()

    # 3. Seed Talent Shortlist Board
    if brand_user and elena and db.query(TalentShortlist).count() == 0:
        board = TalentShortlist(
            creator_id=brand_user.id,
            title="Paris Haute Couture FW27 — Principal Lineup",
            description="Hand-selected high-fashion runway models for the upcoming Paris fashion calendar.",
            campaign_name="Paris FW27 Grand Finale",
            is_private="private",
        )
        db.add(board)
        db.flush()

        item1 = ShortlistItem(
            shortlist_id=board.id,
            model_profile_id=elena.id,
            casting_status="shortlisted",
            internal_notes="First choice for opening look. Confirmed passport & Paris availability.",
        )
        db.add(item1)
        if siddharth:
            item2 = ShortlistItem(
                shortlist_id=board.id,
                model_profile_id=siddharth.id,
                casting_status="considering",
                internal_notes="Reviewing suiting tear-sheets for menswear segment.",
            )
            db.add(item2)

        db.commit()

def seed_phase5_data(db: Session):
    """Seed Phase 5 demo data: Call sheets, availability calendar, and financial invoices."""
    import json
    from app.models.logistics import ProductionCallSheet, AvailabilityEntry, Invoice
    from app.models.model_profile import ModelProfile
    from app.models.booking import BookingOffer
    from app.models.user import User

    brand_user = db.query(User).filter(User.email == "brand@modelhub.com").first()
    elena = db.query(ModelProfile).filter(ModelProfile.username == "elenarostova").first()
    siddharth = db.query(ModelProfile).filter(ModelProfile.username == "modelhub_talent").first()

    # 1. Seed Production Call Sheet
    if brand_user and elena and db.query(ProductionCallSheet).count() == 0:
        schedule = [
            {"time": "07:30 AM", "activity": "Crew Arrival & Lighting Setup", "notes": "Main Studio Bay 2"},
            {"time": "08:15 AM", "activity": "Talent Call & Breakfast", "notes": "Catering in Green Room"},
            {"time": "08:30 AM", "activity": "Hair & Makeup First Look", "notes": "Natural dewy editorial base"},
            {"time": "10:00 AM", "activity": "First Shot — Look 1 (Chanel Haute Couture)", "notes": "Architectural high-angle key light"},
            {"time": "01:00 PM", "activity": "Catering Lunch Break", "notes": "Healthy Mediterranean spread"},
            {"time": "02:00 PM", "activity": "Look 2 — Saint Laurent Evening Silhouettes", "notes": "Dramatic rim lighting"},
            {"time": "06:00 PM", "activity": "Estimated Wrap & Raw Capture Review", "notes": "Digital asset handoff to Vogue editor"},
        ]
        crew = [
            {"role": "Creative Director", "name": "Claire Dubois", "phone": "+33 6 12 34 56 78"},
            {"role": "Lead Photographer", "name": "Marcus Vance", "phone": "+33 6 98 76 54 32"},
            {"role": "Head of Styling", "name": "Antoine Mercier", "phone": "+33 6 44 55 66 77"},
            {"role": "Lead Hair & MUA", "name": "Sophie Laurent", "phone": "+33 6 22 33 44 55"},
            {"role": "Production Coordinator", "name": "Lucas Moreau", "phone": "+33 6 11 22 33 44"},
        ]
        cs = ProductionCallSheet(
            creator_id=brand_user.id,
            model_profile_id=elena.id,
            shoot_title="Vogue Paris — Architectural Winter Monolith",
            production_company="Condé Nast France / Noir Élite Studio",
            shoot_date="2026-11-20",
            general_call_time="07:30 AM",
            talent_call_time="08:15 AM",
            shoot_location="Studio Daylight, 14 Rue de Charonne, 75011 Paris, France",
            location_notes="Security code #4829B. Freight elevator available on right corridor. Reserved parking in bay 4.",
            wardrobe_brief="Haute Couture pieces provided on set. Skin clean & unmoisturized upon arrival.",
            catering_notes="Full vegan & pescatarian menu options provided.",
            schedule_blocks=json.dumps(schedule),
            crew_contacts=json.dumps(crew),
            attendance_status="confirmed",
        )
        db.add(cs)
        db.commit()

    # 2. Seed Availability Calendar Holds
    if elena and db.query(AvailabilityEntry).count() == 0:
        entries = [
            AvailabilityEntry(model_profile_id=elena.id, date="2026-11-20", status="booked", city_location="Paris", project_label="Vogue Paris Cover Shoot"),
            AvailabilityEntry(model_profile_id=elena.id, date="2026-11-21", status="booked", city_location="Paris", project_label="Vogue Paris Editorial"),
            AvailabilityEntry(model_profile_id=elena.id, date="2026-11-25", status="option_1", city_location="Milan", project_label="Prada Option 1 Hold"),
            AvailabilityEntry(model_profile_id=elena.id, date="2026-11-26", status="option_2", city_location="Milan", project_label="Versace Commercial Penciled"),
            AvailabilityEntry(model_profile_id=elena.id, date="2026-12-01", status="travel", city_location="Paris → Dubai", project_label="Flight Transit"),
            AvailabilityEntry(model_profile_id=elena.id, date="2026-12-10", status="blackout", city_location="Personal", project_label="Annual Rest / Off Days", is_private=True),
        ]
        if siddharth:
            entries.extend([
                AvailabilityEntry(model_profile_id=siddharth.id, date="2026-12-05", status="booked", city_location="Mumbai", project_label="Raymond Suiting Campaign"),
                AvailabilityEntry(model_profile_id=siddharth.id, date="2026-12-12", status="option_1", city_location="Delhi", project_label="GQ Magazine Menswear Hold"),
            ])
        for e in entries:
            db.add(e)
        db.commit()

    # 3. Seed Commercial Invoices & Escrow
    if brand_user and elena and db.query(Invoice).count() == 0:
        inv1 = Invoice(
            invoice_number="CMID-INV-2026-00001",
            client_id=brand_user.id,
            model_profile_id=elena.id,
            project_title="Vogue Paris — Architectural Winter Editorial",
            currency="INR",
            gross_amount=185000.0,
            agency_fee_percentage=20.0,
            agency_fee_amount=37000.0,
            net_talent_amount=148000.0,
            tax_amount=33300.0,
            total_amount=218300.0,
            payment_status="in_escrow",
            due_date="2026-12-15",
            payment_method="Escrow Wire Transfer",
        )
        db.add(inv1)

        if siddharth:
            inv2 = Invoice(
                invoice_number="CMID-INV-2026-00002",
                client_id=brand_user.id,
                model_profile_id=siddharth.id,
                project_title="Raymond Bespoke Autumn Suiting Lookbook",
                currency="INR",
                gross_amount=95000.0,
                agency_fee_percentage=20.0,
                agency_fee_amount=19000.0,
                net_talent_amount=76000.0,
                tax_amount=17100.0,
                total_amount=112100.0,
                payment_status="paid",
                due_date="2026-12-30",
                payment_method="UPI / Direct NetBanking",
            )
            db.add(inv2)

        db.commit()


def seed_phase6_data(db: Session):
    """Seed Phase 6 demo data: Real-time user notifications."""
    from app.models.notification import Notification
    from app.models.user import User

    model_user = db.query(User).filter(User.email == "model@modelhub.com").first()
    brand_user = db.query(User).filter(User.email == "brand@modelhub.com").first()

    if db.query(Notification).count() == 0:
        notifs = []
        if model_user:
            notifs.extend([
                Notification(
                    user_id=model_user.id,
                    title="Direct Contract Offer: Vogue Editorial",
                    message="Brand Vogue issued an exclusive commercial offer of INR 150,000 for your review.",
                    category="booking",
                    action_url="/bookings",
                    is_read=False,
                ),
                Notification(
                    user_id=model_user.id,
                    title="Call Sheet Published: Studio 9 Shoot",
                    message="Your call sheet for tomorrow at 08:30 AM has been published. Please confirm attendance.",
                    category="call_sheet",
                    action_url="/call-sheets",
                    is_read=False,
                ),
                Notification(
                    user_id=model_user.id,
                    title="Commercial Escrow Funded",
                    message="Client has deposited INR 118,000 into secure escrow vault for your upcoming campaign.",
                    category="finance",
                    action_url="/finances",
                    is_read=False,
                ),
                Notification(
                    user_id=model_user.id,
                    title="Application Shortlisted!",
                    message="Your casting application for 'Lakme Fashion Week Runway 2026' was moved to shortlisted.",
                    category="casting",
                    action_url="/castings",
                    is_read=True,
                ),
            ])

        if brand_user:
            notifs.extend([
                Notification(
                    user_id=brand_user.id,
                    title="Model Counter-Offer Received",
                    message="Elena Rostova submitted a counter-proposal of INR 90,000 for your contract offer.",
                    category="booking",
                    action_url="/bookings",
                    is_read=False,
                ),
                Notification(
                    user_id=brand_user.id,
                    title="New Casting Applicant",
                    message="Aarav Mehta applied to your 'Couture Autumn Campaign' casting call.",
                    category="casting",
                    action_url="/castings",
                    is_read=False,
                ),
                Notification(
                    user_id=brand_user.id,
                    title="Talent Check-in: En Route",
                    message="Siddharth Varma updated live status to 'En Route' for Call Sheet #1.",
                    category="call_sheet",
                    action_url="/call-sheets",
                    is_read=True,
                ),
            ])

        for n in notifs:
            db.add(n)
        db.commit()
