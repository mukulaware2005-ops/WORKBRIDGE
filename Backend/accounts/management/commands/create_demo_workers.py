from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import User, WorkerProfile, Skill, Service, Review


# =========================================================
# DEMO WORKERS
# =========================================================

DEMO_WORKERS = [
    ("Rahul Sharma", "rahul.demo@workbridge.com", "Home Cleaner", "cleaning", "Male"),
    ("Priya Patil", "priya.demo@workbridge.com", "Professional Maid", "maid", "Female"),
    ("Amit Deshmukh", "amit.demo@workbridge.com", "Plumber", "plumber", "Male"),
    ("Sneha Kulkarni", "sneha.demo@workbridge.com", "Home Cook", "cook", "Female"),
    ("Vikas Jadhav", "vikas.demo@workbridge.com", "Electrician", "electrician", "Male"),
    ("Neha Thakur", "neha.demo@workbridge.com", "Baby Care Worker", "baby-care", "Female"),
    ("Suresh Pawar", "suresh.demo@workbridge.com", "AC Repair Expert", "ac-repair", "Male"),
    ("Pooja Shinde", "pooja.demo@workbridge.com", "House Maid", "maid", "Female"),
    ("Rohit More", "rohit.demo@workbridge.com", "Painter", "painting", "Male"),
    ("Kavita Desai", "kavita.demo@workbridge.com", "Elder Care Worker", "elder-care", "Female"),
    ("Akash Wankhede", "akash.demo@workbridge.com", "Carpenter", "carpenter", "Male"),
    ("Manisha Raut", "manisha.demo@workbridge.com", "Home Cleaner", "cleaning", "Female"),
    ("Nitin Bhosale", "nitin.demo@workbridge.com", "Electrician", "electrician", "Male"),
    ("Swati Joshi", "swati.demo@workbridge.com", "Home Cook", "cook", "Female"),
    ("Ganesh Kale", "ganesh.demo@workbridge.com", "Plumber", "plumber", "Male"),
    ("Anjali Pawar", "anjali.demo@workbridge.com", "Professional Maid", "maid", "Female"),
    ("Sachin Chavan", "sachin.demo@workbridge.com", "Carpenter", "carpenter", "Male"),
    ("Riya Deshmukh", "riya.demo@workbridge.com", "Baby Care Worker", "baby-care", "Female"),
    ("Mahesh Patil", "mahesh.demo@workbridge.com", "Painter", "painting", "Male"),
    ("Aarti Wankhede", "aarti.demo@workbridge.com", "Home Cleaner", "cleaning", "Female"),
    ("Deepak Shinde", "deepak.demo@workbridge.com", "AC Repair Expert", "ac-repair", "Male"),
    ("Meena Jadhav", "meena.demo@workbridge.com", "Elder Care Worker", "elder-care", "Female"),
    ("Prakash More", "prakash.demo@workbridge.com", "Electrician", "electrician", "Male"),
    ("Nisha Kale", "nisha.demo@workbridge.com", "Home Cook", "cook", "Female"),
    ("Vijay Pawar", "vijay.demo@workbridge.com", "Plumber", "plumber", "Male"),
    ("Komal Patil", "komal.demo@workbridge.com", "Professional Maid", "maid", "Female"),
    ("Ramesh Chavan", "ramesh.demo@workbridge.com", "Carpenter", "carpenter", "Male"),
    ("Snehal More", "snehal.demo@workbridge.com", "Home Cleaner", "cleaning", "Female"),
    ("Ajay Bhosale", "ajay.demo@workbridge.com", "Painter", "painting", "Male"),
    ("Pallavi Desai", "pallavi.demo@workbridge.com", "Elder Care Worker", "elder-care", "Female"),
]


# =========================================================
# DEMO REVIEW COMMENTS
# =========================================================

REVIEW_COMMENTS = [
    (5, "Excellent service. Very professional and punctual."),
    (5, "Very good experience. Would definitely recommend."),
    (4, "Good quality of work and friendly behaviour."),
    (5, "Very reliable and completed the work perfectly."),
    (4, "Good service and reasonable price."),
]


# =========================================================
# DEMO CUSTOMER ACCOUNTS
# =========================================================

DEMO_CUSTOMERS = [
    ("Demo Customer 1", "customer1.demo@workbridge.com"),
    ("Demo Customer 2", "customer2.demo@workbridge.com"),
    ("Demo Customer 3", "customer3.demo@workbridge.com"),
    ("Demo Customer 4", "customer4.demo@workbridge.com"),
    ("Demo Customer 5", "customer5.demo@workbridge.com"),
]


# =========================================================
# COMMAND
# =========================================================

class Command(BaseCommand):

    help = "Create 30 demo workers with locations, services and ratings."

    def add_arguments(self, parser):
        parser.add_argument(
            "--password",
            default="Demo@12345",
            help="Password for demo accounts.",
        )

    @transaction.atomic
    def handle(self, *args, **options):

        password = options["password"]

        # -------------------------------------------------
        # CREATE DEMO CUSTOMERS
        # -------------------------------------------------

        customers = []

        for name, email in DEMO_CUSTOMERS:

            customer, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "role": User.Role.CUSTOMER,
                    "first_name": name.split()[0],
                    "last_name": " ".join(name.split()[1:]),
                    "is_active": True,
                    "is_email_verified": True,
                },
            )

            customer.role = User.Role.CUSTOMER
            customer.is_active = True
            customer.is_email_verified = True

            if created:
                customer.set_password(password)

            customer.save()

            customers.append(customer)

        # -------------------------------------------------
        # CREATE DEMO WORKERS
        # -------------------------------------------------

        created_workers = 0
        updated_workers = 0
        created_reviews = 0

        # Amravati center coordinates
        base_latitude = 20.9374
        base_longitude = 77.7796

        # Locations spread around Amravati
        locations = [
            (0.0000, 0.0000),
            (0.0100, 0.0050),
            (-0.0100, -0.0050),
            (0.0200, 0.0100),
            (-0.0200, -0.0100),
            (0.0300, 0.0150),
            (-0.0300, -0.0150),
            (0.0400, 0.0200),
            (-0.0400, -0.0200),
            (0.0500, 0.0250),
            (-0.0500, -0.0250),
            (0.0600, 0.0300),
            (-0.0600, -0.0300),
            (0.0700, 0.0350),
            (-0.0700, -0.0350),
            (0.0800, 0.0400),
            (-0.0800, -0.0400),
            (0.0900, 0.0450),
            (-0.0900, -0.0450),
            (0.1000, 0.0500),
            (-0.1000, -0.0500),
            (0.1100, 0.0550),
            (-0.1100, -0.0550),
            (0.1200, 0.0600),
            (-0.1200, -0.0600),
            (0.1300, 0.0650),
            (-0.1300, -0.0650),
            (0.1400, 0.0700),
            (-0.1400, -0.0700),
            (0.1500, 0.0750),
        ]

        for index, worker_data in enumerate(DEMO_WORKERS):

            name, email, title, category, gender = worker_data

            latitude_offset, longitude_offset = locations[index]

            latitude = Decimal(
                str(round(base_latitude + latitude_offset, 6))
            )

            longitude = Decimal(
                str(round(base_longitude + longitude_offset, 6))
            )

            first_name = name.split()[0]
            last_name = " ".join(name.split()[1:])

            # ---------------------------------------------
            # USER
            # ---------------------------------------------

            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "role": User.Role.WORKER,
                    "first_name": first_name,
                    "last_name": last_name,
                    "is_active": True,
                    "is_email_verified": True,
                },
            )

            user.role = User.Role.WORKER
            user.first_name = first_name
            user.last_name = last_name
            user.is_active = True
            user.is_email_verified = True

            if created:
                user.set_password(password)
                created_workers += 1
            else:
                updated_workers += 1

            user.save()

            # ---------------------------------------------
            # WORKER PROFILE
            # ---------------------------------------------

            profile, profile_created = WorkerProfile.objects.get_or_create(
                user=user,
                defaults={
                    "title": title,
                    "category": category,
                    "experience_years": 2 + (index % 8),
                    "about": (
                        f"{name} is an experienced {title.lower()} "
                        "providing reliable household services."
                    ),
                    "city": "Amravati",
                    "area": f"Area {index + 1}, Amravati",
                    "latitude": latitude,
                    "longitude": longitude,
                    "languages": ["English", "Hindi", "Marathi"],
                    "gender": gender,
                    "starting_price": Decimal(str(300 + (index % 5) * 100)),
                    "hourly_rate": Decimal(str(150 + (index % 4) * 50)),
                    "emergency_charge": Decimal(str(200 + (index % 3) * 100)),
                    "emergency_available": index % 3 != 0,
                    "working_days": [
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                    ],
                    "working_hours": "9:00 AM - 7:00 PM",
                    "is_premium": index % 5 == 0,
                    "is_featured": index % 4 == 0,
                    "is_identity_verified": True,
                    "is_police_verified": index % 3 != 0,
                    "is_certificate_verified": index % 2 == 0,
                    "is_phone_verified": True,
                },
            )

            # Update existing profile too
            profile.title = title
            profile.category = category
            profile.latitude = latitude
            profile.longitude = longitude
            profile.city = "Amravati"
            profile.area = f"Area {index + 1}, Amravati"
            profile.gender = gender
            profile.is_identity_verified = True
            profile.is_phone_verified = True
            profile.save()

            # ---------------------------------------------
            # SKILLS
            # ---------------------------------------------

            skill_names = [
                title,
                "Household Work",
                "Professional Service",
            ]

            for skill_name in skill_names:

                skill, _ = Skill.objects.get_or_create(
                    name=skill_name
                )

                profile.skills.add(skill)

            # ---------------------------------------------
            # SERVICE
            # ---------------------------------------------

            service_name = f"{title} Service"

            Service.objects.get_or_create(
                worker=profile,
                name=service_name,
                defaults={
                    "description": (
                        f"Professional {title.lower()} service "
                        "for household requirements."
                    ),
                    "price": profile.starting_price,
                    "duration_minutes": 120,
                    "is_emergency_available": profile.emergency_available,
                    "is_active": True,
                },
            )

            # ---------------------------------------------
            # REVIEWS
            # ---------------------------------------------

            for review_index, (rating, comment) in enumerate(REVIEW_COMMENTS):

                customer = customers[review_index]

                review, review_created = Review.objects.get_or_create(
                    worker=profile,
                    customer=customer,
                    comment=comment,
                    defaults={
                        "rating": rating,
                    },
                )

                if review_created:
                    created_reviews += 1

        # -------------------------------------------------
        # FINAL OUTPUT
        # -------------------------------------------------

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                "=============================================="
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                "DEMO DATA CREATED SUCCESSFULLY"
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                "=============================================="
            )
        )

        self.stdout.write(
            f"Workers created: {created_workers}"
        )

        self.stdout.write(
            f"Workers updated: {updated_workers}"
        )

        self.stdout.write(
            f"Reviews created: {created_reviews}"
        )

        self.stdout.write(
            "Demo worker/customer password: "
            + password
        )

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                "30 workers + locations + services + reviews ready."
            )
        )