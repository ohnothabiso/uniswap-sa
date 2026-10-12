from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Since USERNAME_FIELD is 'email', simplejwt already expects an 'email'
    field in the POST body instead of 'username' — this subclass just makes
    that explicit and adds a couple of useful claims to the token."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["full_name"] = user.full_name
        token["role"] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = {
            "user_id": self.user.user_id,
            "email": self.user.email,
            "full_name": self.user.full_name,
            "role": self.user.role,
            "is_staff": self.user.is_staff,
            "avatar_url": getattr(self.user, "avatar_url", ""),
            "campus_residence": getattr(self.user, "campus_residence", ""),
            "faculty": getattr(self.user, "faculty", ""),
            "student_id_number": getattr(self.user, "student_id_number", ""),
            "trust_score": getattr(self.user, "trust_score", 98),
            "items_diverted": getattr(self.user, "items_diverted", 0),
        }
        return data


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer
