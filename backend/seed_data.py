"""
Complete Seed Data for UniSwap SPU Campus Marketplace.
Loads realistic data matching the Stitch design prototypes with expanded real listings.
"""
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from accounts.models import University, User, AdminProfile
from listings.models import Category, Listing, ListingImage
from messaging.models import Message
from favourites.models import Favourite
from notifications.models import Notification

print("Purging existing data...")
Notification.objects.all().delete()
Favourite.objects.all().delete()
Message.objects.all().delete()
ListingImage.objects.all().delete()
Listing.objects.all().delete()
Category.objects.all().delete()
AdminProfile.objects.all().delete()
User.objects.all().delete()
University.objects.all().delete()

print("Creating University...")
spu = University.objects.create(
    name="Sol Plaatje University",
    location="Kimberley, Northern Cape",
    email_domain="spu.ac.za"
)

print("Creating Users...")
users = {}

katlego = User.objects.create_user(
    email="katlego.m@spu.ac.za",
    password="password123",
    full_name="Katlego M.",
    university=spu,
    role=User.Role.STUDENT,
    is_verified=True,
    avatar_url="",
    campus_residence="Moroka Res",
    faculty="Faculty of Humanities",
    student_id_number="SPU-2023-8942",
    trust_score=98,
    items_diverted=14
)
users["katlego"] = katlego

nandi = User.objects.create_user(
    email="nandi.k@spu.ac.za",
    password="password123",
    full_name="Nandi K.",
    university=spu,
    role=User.Role.STUDENT,
    is_verified=True,
    avatar_url="",
    campus_residence="Moroka Res",
    faculty="Faculty of Education",
    student_id_number="SPU-2022-4412",
    trust_score=99,
    items_diverted=8
)
users["nandi"] = nandi

sipho = User.objects.create_user(
    email="sipho.d@spu.ac.za",
    password="password123",
    full_name="Sipho D.",
    university=spu,
    role=User.Role.STUDENT,
    is_verified=True,
    avatar_url="",
    campus_residence="Luka Jantjie Hall",
    faculty="3rd Year Education",
    student_id_number="SPU-2021-1209",
    trust_score=96,
    items_diverted=11
)
users["sipho"] = sipho

lerato = User.objects.create_user(
    email="lerato.b@spu.ac.za",
    password="password123",
    full_name="Lerato B.",
    university=spu,
    role=User.Role.STUDENT,
    is_verified=True,
    avatar_url="",
    campus_residence="Moroka Res",
    faculty="Graduating Student",
    student_id_number="SPU-2020-0081",
    trust_score=100,
    items_diverted=22
)
users["lerato"] = lerato

thabo = User.objects.create_user(
    email="thabo.m@spu.ac.za",
    password="password123",
    full_name="Thabo M.",
    university=spu,
    role=User.Role.STUDENT,
    is_verified=True,
    avatar_url="",
    campus_residence="Sol Plaatje North",
    faculty="SPU ICT Dept",
    student_id_number="SPU-2022-7711",
    trust_score=97,
    items_diverted=6
)
users["thabo"] = thabo

zola = User.objects.create_user(
    email="zola.n@spu.ac.za",
    password="password123",
    full_name="Zola N.",
    university=spu,
    role=User.Role.STUDENT,
    is_verified=True,
    avatar_url="",
    campus_residence="Off-Campus",
    faculty="SPU Alum 2024",
    student_id_number="SPU-2019-3321",
    trust_score=95,
    items_diverted=17
)
users["zola"] = zola

kagiso = User.objects.create_user(
    email="kagiso.p@spu.ac.za",
    password="password123",
    full_name="Kagiso P.",
    university=spu,
    role=User.Role.STUDENT,
    is_verified=True,
    avatar_url="",
    campus_residence="Moroka Res",
    faculty="Humanities",
    student_id_number="SPU-2023-5599",
    trust_score=94,
    items_diverted=4
)
users["kagiso"] = kagiso

ayesha = User.objects.create_user(
    email="ayesha.m@spu.ac.za",
    password="password123",
    full_name="Ayesha M.",
    university=spu,
    role=User.Role.STUDENT,
    is_verified=True,
    avatar_url="",
    campus_residence="Central Campus",
    faculty="Science Faculty",
    student_id_number="SPU-2024-9122",
    trust_score=99,
    items_diverted=9
)
users["ayesha"] = ayesha

admin = User.objects.create_user(
    email="admin@spu.ac.za",
    password="password123",
    full_name="Campus Admin",
    university=spu,
    role=User.Role.ADMIN,
    is_staff=True,
    is_superuser=True,
    is_verified=True,
    avatar_url="",
    campus_residence="Administration Block",
    faculty="Student Affairs",
    student_id_number="STAFF-001",
    trust_score=100,
    items_diverted=0
)
AdminProfile.objects.create(user=admin, permission="SUPER_ADMIN")
users["admin"] = admin

print("Creating Categories...")
categories = {}
cat_data = [
    ("hoodies", "Hoodies & Sweaters", "Cozy hoodies, knitwear, and campus sweatshirts"),
    ("jackets", "Jackets & Coats", "Denim, leather, puffer, windbreaker, and retro jackets"),
    ("tees", "Campus Tees & Tops", "Everyday t-shirts, polo shirts, and vintage tops"),
    ("denim", "Denim & Trousers", "Jeans, chinos, cargo pants, and sweatpants"),
    ("formal", "Formal & Graduation", "Suits, blazers, graduation gowns and formal dresses"),
    ("footwear", "Sneakers & Footwear", "Athletic shoes, casual sneakers, boots, and sandals"),
    ("textbooks", "Textbooks & Notes", "Academic textbooks, modules, exam prep, and study materials"),
    ("tech", "Tech & Gadgets", "Calculators, headphones, keyboards, and campus electronics"),
    ("academic", "Lab & Academic Gear", "Lab coats, safety goggles, dissecting kits, and equipment"),
]

for slug, name, desc in cat_data:
    cat = Category.objects.create(category_name=name, description=desc)
    categories[slug] = cat

print("Creating Listings...")
listings_data = [
    # 1
    {
        "user": users["nandi"],
        "category": categories["jackets"],
        "title": "Vintage Green Corduroy Overshirt",
        "description": "Looking to trade for a heavy boxy cropped tee or utility canvas tote bag. Excellent condition, worn very few times around campus. Warm and stylish for autumn.",
        "listing_type": Listing.ListingType.SWAP,
        "price": None,
        "condition": Listing.Condition.LIKE_NEW,
        "size": "L",
        "safe_zone": "Central Library Ground Floor",
        "swap_preference": "Heavy boxy cropped tee or canvas tote bag",
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuBKcX7m9Vt-vpTtpCpCDm3R1TQFxnMpp5HRBCWtTNjQzODW-mfZkDxuptxYErASeVdg8T90Q7ayFA_FyIfw4n1LYvYDjU3O-vX5yEhLWJmrI2KC-wS7jujNRldQsjcR7RZJJTxKLG9TtVEfOZc9lnX1d4q55fq8anP1UJl2tQxtje9kTPILjY-D0nQtcKNK3UdXpSjYpsajfrWrnaez9aHuar7WEnnFZ0duAqThau_UgTiSdKusOmS4bQ",
        "status": Listing.Status.LIVE,
    },
    # 2
    {
        "user": users["sipho"],
        "category": categories["hoodies"],
        "title": "SPU Official Varsity Fleece Hoodie",
        "description": "Authentic campus store apparel, barely worn. Clean fleece lining with high quality embroidered gold lettering. Kept in smoke-free dorm.",
        "listing_type": Listing.ListingType.SWAP,
        "price": None,
        "condition": Listing.Condition.LIKE_NEW,
        "size": "M",
        "safe_zone": "Luka Jantjie Hall Security Desk",
        "swap_preference": "Open to trade for campus hoodies, denim, or tees",
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuCGTlBj50856PT0BD74Fwokv4sWZt_WLPR1r5cjS3eud_idcHJ3YQQLlcC__iiSrq0Fqg2RbfJ5tgdDSe9StGN3NZY_ALf3DpV9lyBEtfGrm4FdVBVweP0XU5QHQFVuxuKo9Gf-j34F1tFI0ly8CUM2117lefewHWHeYg81gcB0FYoiBRvQqaaEatmmGuD0f_fZpUtD-yZ4NHUSWQOHdB9T-GAX2ecSeMDi0QzyvF23zUATZP6gUbW7rw",
        "status": Listing.Status.LIVE,
    },
    # 3
    {
        "user": users["lerato"],
        "category": categories["hoodies"],
        "title": "Oversized Cableknit Cream Jumper",
        "description": "Passing forward before graduation vac! Super warm for chilly Kimberley mornings. 100% free to any student who needs winter clothing.",
        "listing_type": Listing.ListingType.DONATE,
        "price": None,
        "condition": Listing.Condition.GOOD,
        "size": "S/M",
        "safe_zone": "Moroka Res Front Desk",
        "swap_preference": "Open to trade for campus hoodies, denim, or tees",
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuCBXx2m6pgMkYVTXZRfjdjikKFIWWDCkghEz51RSwhav2-8iaAx3AEfu42uh1-JbA2ELHXtleQYqpT5cmXD7tOJ-iFNCIFrU33o0AxUlnks_kM4pE0HRZs17lUBpM9NoMLO_gONKXSiCGbNAy7gPSq-y3tzUj-x1UStT5hlvn7yCUPkrqjuBVTKiI8X_dy5xzOObQ_C_M43kRsQv0Rmer0TX-VHRA2Lg7tbggdniPURf-PmI4dHBfc-CQ",
        "status": Listing.Status.LIVE,
    },
    # 4
    {
        "user": users["thabo"],
        "category": categories["jackets"],
        "title": "Classic Washed Denim Trucker Jacket",
        "description": "Seeking swap for olive green cargo pants or leather Chelsea boots size 9. Heavy vintage denim with authentic brass hardware.",
        "listing_type": Listing.ListingType.SWAP,
        "price": None,
        "condition": Listing.Condition.GOOD,
        "size": "XL",
        "safe_zone": "Luka Jantjie Wing B",
        "swap_preference": "Cargo pants or boots (size 9)",
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuDb3YXyP0J7wvG1O63evMR0fLm_k4EAkFY_cAuMR0_gulRJIwLBjRdjPtdhSvGV3633a0V8rnD0_J_rd6CWsHKhDeMK9UFMb6787pTHcTmQ4c-epCWVv6WVvM8lXLGfuZkdsY3PP0elgcB_xdmXOlh_qgBXK2X178hWSap0ohitqK5kHm_jtuD2g3dxYknblsXW6JliDED1QMatwIE6pPOVbAmogWFUHciuZI2JuncaALeqCRDU7uZrzg",
        "status": Listing.Status.LIVE,
    },
    # 5
    {
        "user": users["zola"],
        "category": categories["formal"],
        "title": "Academic Gown & Mortarboard Set",
        "description": "Available for ceremony hire or purchase/swap. Worn once during Autumn graduations. Crisp pleated black fabric with velvet band and tassel.",
        "listing_type": Listing.ListingType.SWAP,
        "price": None,
        "condition": Listing.Condition.LIKE_NEW,
        "size": "Std 54",
        "safe_zone": "Central Library Foyer",
        "swap_preference": "Formal job interview blazer",
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAndQ9viGL4P1Y32_TQys_L3oDiB6FEpYQv4fdYXaU0FPW6ayicgRFftcXY39bDvy9KNBH2UeBHkNTVTmr-eEXDbdKSHa1FLrR2dhN10umzha3-wdCvNRhsg1ftq20yyI21RqV0PlmcLd2cZ9_TAHLMx69WTCiGrYMZedhDZoUf3yIKXaOtXYWYAb-ragsau9G7u7KnClH_4SlX7BcaOIMD-EWSWMpJyYETctYswY78JeFTqXxkskTXUA",
        "status": Listing.Status.LIVE,
    },
    # 6
    {
        "user": users["kagiso"],
        "category": categories["footwear"],
        "title": "Chunky White Platform Sneakers",
        "description": "Worn twice for orientation week. Deep cleaned soles, cushioned arch support. Super comfortable for trekking between Central and South campus.",
        "listing_type": Listing.ListingType.SWAP,
        "price": None,
        "condition": Listing.Condition.LIKE_NEW,
        "size": "UK 6",
        "safe_zone": "Moroka Dining Hall",
        "swap_preference": "Open to trade for campus hoodies, denim, or tees",
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuBdxGxcdnr1mqruKzZ0nD3lvx0p1qAU6FZvdc9c80L8xXgJ0X3AbRVpQ-m-npyXXiXbW8_Z4EXScHf8VgtGPW7DjHAjJuA0Jf1uFZozvVX7TD8n1JgxiVT8oh3c9ez7Ire2501axNE1CMYJYSynr76-CQAmW9qId2UFcWwxf6ZSMzzo00Q5FTIOLCrXz1M-RU4K2h6fktAwYzEyJuwjm60a2loJ_AoU_KnAIY4LN4StrRvuTLxzXB5How",
        "status": Listing.Status.LIVE,
    },
    # 7
    {
        "user": users["ayesha"],
        "category": categories["formal"],
        "title": "Thrifted Botanical Sundress",
        "description": "Gorgeous breezy floral print dress. Free donation to any student as I am downsizing my closet for vacation. Breathable cotton blend.",
        "listing_type": Listing.ListingType.DONATE,
        "price": None,
        "condition": Listing.Condition.LIKE_NEW,
        "size": "S",
        "safe_zone": "Central Library Safe Zone",
        "swap_preference": "Open to trade for campus hoodies, denim, or tees",
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuCJDboLIBUIJ-yWQwG35G8veNlM3Wir6PszFP86_l3QFtmWcfh14yvCbliEgYYGY-PYHHJSAXq80IsMHtEQ1MrItknu-tc2GWZuxI9TbQaZ1IdI3Bo2TqPK1YnsY0otdTojbAUQPXpW9-k7z9pt6SIYdovdXAUU1qPgOr9F8Z6ktdDtIYGVtXIdblPnMzoQyXYfq2c0RsZ2OdnZKkKQ_6mhAjJ9-M23144Tvzjji2ly3Benc90Hr8evWA",
        "status": Listing.Status.LIVE,
    },
    # 8
    {
        "user": users["thabo"],
        "category": categories["jackets"],
        "title": "Retro 1990s Colorblock Windbreaker",
        "description": "Lightweight water-resistant windbreaker in forest green, white and navy. Elasticated cuffs and drawstring hem.",
        "listing_type": Listing.ListingType.SWAP,
        "price": None,
        "condition": Listing.Condition.GOOD,
        "size": "L",
        "safe_zone": "Student Union Porch",
        "swap_preference": "Vintage track pants or oversized hoodie",
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuCE1UT5gdTrmnpb8aRpdfeHZ6GwpvNz6Ws3C9bAu5nmiiV01D5rl_0uM-pb1YTx8Om3Al61GN30yyh5oUpnthBvm8VMKn6Dix3ZT4wE7r2qkBl8oqn7nfp7G_teKU2t3bd6Kdb1cj6-Qtusff4Maw2rlptdQj9Ts0KHbT-v3HyCCyUV_mPVnCJo1CE8xGWpUGdVHCjc6qrN_WHPYSMDegYH2sFHhCWUnSnaoxfrSEYW0dVzb1hVIEQbAA",
        "status": Listing.Status.LIVE,
    },
    # 9
    {
        "user": users["katlego"],
        "category": categories["tees"],
        "title": "Retro Graphic Band T-Shirt",
        "description": "Black heavy cotton tee with distressed vintage print. Washed soft, boxy fit, great condition.",
        "listing_type": Listing.ListingType.SWAP,
        "price": None,
        "condition": Listing.Condition.GOOD,
        "size": "M",
        "safe_zone": "Central Library Ground Floor",
        "swap_preference": "White linen button-up or cap",
        "image_url": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
        "status": Listing.Status.LIVE,
    },
    # 10
    {
        "user": users["katlego"],
        "category": categories["denim"],
        "title": "Straight-Leg Selvedge Indigo Jeans",
        "description": "High-durability Japanese selvedge denim. Classic five-pocket straight cut that pairs nicely with sneakers or boots.",
        "listing_type": Listing.ListingType.SWAP,
        "price": None,
        "condition": Listing.Condition.LIKE_NEW,
        "size": "32/32",
        "safe_zone": "Moroka Res Front Desk",
        "swap_preference": "Open to trade for campus hoodies, denim, or tees",
        "image_url": "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=600&q=80",
        "status": Listing.Status.LIVE,
    },
    # 11: TEXTBOOK (Donation)
    {
        "user": users["ayesha"],
        "category": categories["textbooks"],
        "title": "Campbell Biology (12th Global Edition)",
        "description": "Passed 1st Year Biology! Donating this massive hardcover textbook to an incoming Science student. Clean pages, no missing diagrams, bound solidly.",
        "listing_type": Listing.ListingType.DONATE,
        "price": None,
        "condition": Listing.Condition.LIKE_NEW,
        "size": "Hardcover",
        "safe_zone": "Central Library Study Pods",
        "swap_preference": "Open to trade for campus hoodies, denim, or tees",
        "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
        "status": Listing.Status.LIVE,
    },
    # 12: TEXTBOOK (Sale)
    {
        "user": users["sipho"],
        "category": categories["textbooks"],
        "title": "Economics for South African Students (6th Ed)",
        "description": "Mohr & Fourie standard economics text. Used for ECS modules. Includes typed summary notes and exam past-paper formula sheets.",
        "listing_type": Listing.ListingType.SWAP,
        "price": None,
        "condition": Listing.Condition.GOOD,
        "size": "Paperback",
        "safe_zone": "Luka Jantjie Hall Security Desk",
        "swap_preference": "Open to trade for campus hoodies, denim, or tees",
        "image_url": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
        "status": Listing.Status.LIVE,
    },
    # 13: TEXTBOOK (Swap)
    {
        "user": users["thabo"],
        "category": categories["textbooks"],
        "title": "Calculus: Early Transcendentals (8th Edition)",
        "description": "James Stewart calculus textbook for Engineering & Science students. Great condition. Looking to trade for Data Structures in Python or Linear Algebra notes.",
        "listing_type": Listing.ListingType.SWAP,
        "price": None,
        "condition": Listing.Condition.GOOD,
        "size": "Textbook",
        "safe_zone": "Central Library Foyer",
        "swap_preference": "Python Data Structures or Linear Algebra textbook",
        "image_url": "https://images.unsplash.com/photo-1532012164546-f432f2e37b73?auto=format&fit=crop&w=600&q=80",
        "status": Listing.Status.LIVE,
    },
    # 14: TECH (Sale)
    {
        "user": users["kagiso"],
        "category": categories["tech"],
        "title": "Casio FX-991ZA Plus II Scientific Calculator",
        "description": "Official SPU exam-board approved scientific calculator with natural textbook display. Brand new battery installed, protective slide cover included.",
        "listing_type": Listing.ListingType.SWAP,
        "price": None,
        "condition": Listing.Condition.LIKE_NEW,
        "size": "One Size",
        "safe_zone": "Central Library Ground Floor",
        "swap_preference": "Open to trade for campus hoodies, denim, or tees",
        "image_url": "https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48f?auto=format&fit=crop&w=600&q=80",
        "status": Listing.Status.LIVE,
    },
    # 15: TECH (Sale)
    {
        "user": users["katlego"],
        "category": categories["tech"],
        "title": "Sony WH-CH520 Wireless Bluetooth Headphones",
        "description": "Black wireless headphones with up to 50 hours of battery life and built-in handsfree mic for online lectures. Super clean cushions.",
        "listing_type": Listing.ListingType.SWAP,
        "price": None,
        "condition": Listing.Condition.LIKE_NEW,
        "size": "Adjustable",
        "safe_zone": "Student Union Porch",
        "swap_preference": "Open to trade for campus hoodies, denim, or tees",
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
        "status": Listing.Status.LIVE,
    },
    # 16: TECH (Swap)
    {
        "user": users["thabo"],
        "category": categories["tech"],
        "title": "Logitech K380 Multi-Device Bluetooth Keyboard",
        "description": "Minimalist portable keyboard that connects to laptop, tablet, or phone. Whisper-quiet scissor keys. Seeking swap for a gaming mouse or USB-C hub.",
        "listing_type": Listing.ListingType.SWAP,
        "price": None,
        "condition": Listing.Condition.LIKE_NEW,
        "size": "Compact",
        "safe_zone": "Luka Jantjie Wing B",
        "swap_preference": "USB-C Multiport Dongle or Logitech Wireless Mouse",
        "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
        "status": Listing.Status.LIVE,
    },
    # 17: ACADEMIC (Sale)
    {
        "user": users["ayesha"],
        "category": categories["academic"],
        "title": "Unisex SPU Science Lab Coat & UV Goggles",
        "description": "100% white cotton knee-length laboratory coat with snap buttons and clear anti-splash safety goggles. Compulsory for 1st year Chemistry/Biology.",
        "listing_type": Listing.ListingType.SWAP,
        "price": None,
        "condition": Listing.Condition.LIKE_NEW,
        "size": "M",
        "safe_zone": "Central Library Ground Floor",
        "swap_preference": "Open to trade for campus hoodies, denim, or tees",
        "image_url": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
        "status": Listing.Status.LIVE,
    },
    # 18: ACADEMIC (Donation)
    {
        "user": users["lerato"],
        "category": categories["academic"],
        "title": "Anatomy & Zoology Dissection Tool Kit",
        "description": "Complete stainless steel scalpel set with blades, forceps, blunt probe and scissors in zipped leatherette carry case. Free to any junior student.",
        "listing_type": Listing.ListingType.DONATE,
        "price": None,
        "condition": Listing.Condition.GOOD,
        "size": "12-Piece",
        "safe_zone": "Moroka Res Front Desk",
        "swap_preference": "Open to trade for campus hoodies, denim, or tees",
        "image_url": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
        "status": Listing.Status.LIVE,
    },
    # 19: JACKETS (Swap)
    {
        "user": users["sipho"],
        "category": categories["jackets"],
        "title": "K-Way Men's Drake Down Puffer Jacket",
        "description": "Navy blue lightweight packable down jacket, super warm for windy Kimberley winter days. Swap for heavy wool trench coat or leather boots.",
        "listing_type": Listing.ListingType.SWAP,
        "price": None,
        "condition": Listing.Condition.GOOD,
        "size": "L",
        "safe_zone": "Luka Jantjie Hall Security Desk",
        "swap_preference": "Wool overcoat or Dr Martens boots",
        "image_url": "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=600&q=80",
        "status": Listing.Status.LIVE,
    },
    # 20: FOOTWEAR (Sale)
    {
        "user": users["kagiso"],
        "category": categories["footwear"],
        "title": "Nike Air Force 1 '07 Low Triple White",
        "description": "The quintessential campus sneaker. Real leather, freshly cleaned and whitened. Sole has tons of life remaining.",
        "listing_type": Listing.ListingType.SWAP,
        "price": None,
        "condition": Listing.Condition.GOOD,
        "size": "UK 8",
        "safe_zone": "Moroka Dining Hall",
        "swap_preference": "Open to trade for campus hoodies, denim, or tees",
        "image_url": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80",
        "status": Listing.Status.LIVE,
    },
    # 21: FOOTWEAR (Swap)
    {
        "user": users["nandi"],
        "category": categories["footwear"],
        "title": "Dr. Martens 1460 Smooth Leather 8-Eye Boots",
        "description": "Authentic black Dr Martens with iconic yellow welt stitching. Broken-in leather, well conditioned. Want to trade for platform Chelsea boots (size 5).",
        "listing_type": Listing.ListingType.SWAP,
        "price": None,
        "condition": Listing.Condition.GOOD,
        "size": "UK 5",
        "safe_zone": "Central Library Safe Zone",
        "swap_preference": "Black platform Chelsea boots or leather satchel",
        "image_url": "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=600&q=80",
        "status": Listing.Status.LIVE,
    },
    # 22: HOODIES (Swap)
    {
        "user": users["thabo"],
        "category": categories["hoodies"],
        "title": "Collegiate Grey Vintage Crewneck Sweatshirt",
        "description": "Heavyweight 80s style athletic fleece pullover. Thick ribbed collar and cuffs, boxy relaxed fit. Open to trades for flannel shirts or jackets.",
        "listing_type": Listing.ListingType.SWAP,
        "price": None,
        "condition": Listing.Condition.LIKE_NEW,
        "size": "XL",
        "safe_zone": "Luka Jantjie Wing B",
        "swap_preference": "Heavyweight flannel shirt or utility vest",
        "image_url": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80",
        "status": Listing.Status.LIVE,
    },
    # 23: TECH / BAGS (Sale)
    {
        "user": users["zola"],
        "category": categories["tech"],
        "title": "Herschel Classic Navy Student Backpack 24L",
        "description": "Signature striped fabric liner, padded 15-inch laptop sleeve, front storage pocket with key clip. Durable and waterproof.",
        "listing_type": Listing.ListingType.SWAP,
        "price": None,
        "condition": Listing.Condition.LIKE_NEW,
        "size": "24 Litre",
        "safe_zone": "Central Library Foyer",
        "swap_preference": "Open to trade for campus hoodies, denim, or tees",
        "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
        "status": Listing.Status.LIVE,
    },
    # 24: DENIM (Swap)
    {
        "user": users["katlego"],
        "category": categories["denim"],
        "title": "Vintage Levi's 501 Straight Fit Denim",
        "description": "Mid-wash authentic Levi's 501 with copper rivets and button fly. Durable denim, broken in nicely. Trade for relaxed fit carpenter pants or corduroy trousers.",
        "listing_type": Listing.ListingType.SWAP,
        "price": None,
        "condition": Listing.Condition.GOOD,
        "size": "32/32",
        "safe_zone": "Central Library Ground Floor",
        "swap_preference": "Relaxed carpenter pants or corduroy trousers",
        "image_url": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80",
        "status": Listing.Status.LIVE,
    },
]

created_listings = []
for item in listings_data:
    img_url = item.pop("image_url")
    l = Listing.objects.create(**item)
    ListingImage.objects.create(listing=l, image_url=img_url, is_cover=True)
    created_listings.append(l)

print(f"Created {len(created_listings)} listings across {len(categories)} categories!")

print("Creating Favourites...")
Favourite.objects.create(user=katlego, listing=created_listings[0])
Favourite.objects.create(user=katlego, listing=created_listings[1])
Favourite.objects.create(user=katlego, listing=created_listings[2])
Favourite.objects.create(user=katlego, listing=created_listings[10])
Favourite.objects.create(user=katlego, listing=created_listings[13])

print("Creating Messages...")
# Conversation between Katlego and Nandi
Message.objects.create(
    sender=katlego,
    receiver=nandi,
    listing=created_listings[0],
    message_text="Hi Nandi! Is the Vintage Green Corduroy Overshirt still available for a swap?"
)
Message.objects.create(
    sender=nandi,
    receiver=katlego,
    listing=created_listings[0],
    message_text="Hey Katlego! Yes it is! I'm looking for a cropped tee or a tote bag, do you have something similar?"
)
Message.objects.create(
    sender=katlego,
    receiver=nandi,
    listing=created_listings[0],
    message_text="Yes! I have a black graphic band tee in medium that would be a great fit. Can we meet at the Central Library Ground Floor tomorrow?"
)
Message.objects.create(
    sender=nandi,
    receiver=katlego,
    listing=created_listings[0],
    message_text="Perfect! 2 PM at the Central Library Safe Zone sounds great. See you there!"
)

# Conversation between Katlego and Sipho
Message.objects.create(
    sender=katlego,
    receiver=sipho,
    listing=created_listings[1],
    message_text="Hi Sipho, would you consider R150 for the SPU Varsity Hoodie?"
)
Message.objects.create(
    sender=sipho,
    receiver=katlego,
    listing=created_listings[1],
    message_text="Hey! R160 and it's a deal! Let me know if you can meet at Luka Jantjie Hall."
)

print("Creating Notifications...")
Notification.objects.create(
    user=katlego,
    notification_type="NEW_MESSAGE",
    message="Nandi K. replied to your swap proposal",
    link="/messages?with=" + str(nandi.user_id),
    is_read=False
)
Notification.objects.create(
    user=katlego,
    notification_type="ITEM_SAVED",
    message='Sipho D. saved your "Straight-Leg Selvedge Indigo Jeans"',
    link="/listings/" + str(created_listings[9].listing_id),
    is_read=True
)
Notification.objects.create(
    user=katlego,
    notification_type="LISTING_APPROVED",
    message='Your listing "Retro Graphic Band T-Shirt" is now LIVE!',
    link="/listings/" + str(created_listings[8].listing_id),
    is_read=True
)

print("Database seeding completed successfully!")
