from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.exceptions import ValidationError
from django.db import models


class University(models.Model):
    """
    A participating campus. Each university owns an email domain
    (e.g. spu.ac.za) used to restrict registration to verified students.
    """

    university_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=150, unique=True)
    location = models.CharField(max_length=150, blank=True)
    email_domain = models.CharField(
        max_length=100,
        unique=True,
        help_text="Domain students must register with, e.g. 'spu.ac.za' (no @).",
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.ADMIN)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model keyed on university email rather than username,
    matching the "student@spu.ac.za" login flow from the mock-ups.
    """

    class Role(models.TextChoices):
        STUDENT = "STUDENT", "Student"
        ADMIN = "ADMIN", "Campus Admin"

    user_id = models.AutoField(primary_key=True)
    university = models.ForeignKey(
        University, on_delete=models.PROTECT, related_name="users"
    )
    full_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STUDENT)
    date_joined = models.DateTimeField(auto_now_add=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(
        default=False, help_text="Set once the university email has been confirmed."
    )
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    avatar_url = models.URLField(max_length=500, blank=True, default="")
    campus_residence = models.CharField(max_length=150, blank=True, default="Central Campus")
    faculty = models.CharField(max_length=150, blank=True, default="Faculty of Humanities")
    student_id_number = models.CharField(max_length=50, blank=True, default="SPU-2023-8942")
    trust_score = models.IntegerField(default=98)
    items_diverted = models.IntegerField(default=5)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    objects = UserManager()

    def __str__(self):
        return f"{self.full_name} <{self.email}>"

    def clean(self):
        # Enforce that the email domain matches the selected university,
        # e.g. "student@spu.ac.za" must belong to the SPU University row.
        super().clean()
        if self.email and self.university_id:
            domain = self.email.split("@")[-1].lower()
            if domain != self.university.email_domain.lower():
                raise ValidationError(
                    {"email": f"Email must be a @{self.university.email_domain} address."}
                )

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN


class AdminProfile(models.Model):
    """
    Extra permission/audit info for users with elevated (moderator) access,
    matching the 'Admin' entity in the ERD.
    """

    admin_id = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="admin_profile")
    permission = models.CharField(
        max_length=50,
        default="MODERATOR",
        help_text="e.g. MODERATOR, SUPER_ADMIN",
    )
    last_login_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Admin: {self.user.full_name} ({self.permission})"
