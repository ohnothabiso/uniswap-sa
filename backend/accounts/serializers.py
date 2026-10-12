from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import University, User


class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = ["university_id", "name", "location", "email_domain"]


class UserSerializer(serializers.ModelSerializer):
    university_name = serializers.ReadOnlyField(source="university.name")
    avatar = serializers.ImageField(required=False, allow_null=True)
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "user_id", "full_name", "email", "university", "university_name",
            "role", "is_verified", "date_joined", "avatar", "avatar_url",
            "campus_residence", "faculty", "student_id_number", "trust_score", "items_diverted",
        ]
        read_only_fields = ["user_id", "is_verified", "date_joined", "role"]

    def get_avatar_url(self, obj):
        if obj.avatar:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return obj.avatar_url or ""

    def update(self, instance, validated_data):
        raw_avatar_url = self.initial_data.get("avatar_url")
        if "avatar" in validated_data and validated_data["avatar"]:
            instance.avatar = validated_data["avatar"]
            instance.avatar_url = ""
        elif raw_avatar_url:
            instance.avatar_url = raw_avatar_url
            instance.avatar = None
        return super().update(instance, validated_data)


class RegisterSerializer(serializers.ModelSerializer):
    """
    Registers a student using their university email. The email's domain
    must match the selected university's `email_domain` (e.g. spu.ac.za).
    """

    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)
    avatar = serializers.ImageField(required=False, allow_null=True)
    avatar_url = serializers.CharField(required=False, allow_blank=True, default="")

    class Meta:
        model = User
        fields = ["full_name", "email", "university", "password", "password_confirm", "campus_residence", "faculty", "avatar", "avatar_url"]
        extra_kwargs = {
            "campus_residence": {"required": False},
            "faculty": {"required": False},
            "avatar": {"required": False},
            "avatar_url": {"required": False},
        }

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})

        university = attrs.get("university")
        email = attrs.get("email", "")
        domain = email.split("@")[-1].lower() if "@" in email else ""
        if university and domain != university.email_domain.lower():
            raise serializers.ValidationError(
                {"email": f"You must register with a @{university.email_domain} email address."}
            )
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
