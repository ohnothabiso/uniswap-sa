from rest_framework import generics, permissions
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import University, User
from .serializers import RegisterSerializer, UniversitySerializer, UserSerializer


class UniversityListView(generics.ListAPIView):
    """GET /api/accounts/universities/ — populates the university dropdown on signup."""

    queryset = University.objects.all()
    serializer_class = UniversitySerializer
    permission_classes = [permissions.AllowAny]


class RegisterView(generics.CreateAPIView):
    """POST /api/accounts/register/ — create a student account with a university email."""

    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user, context={"request": request}).data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
            status=201,
        )


class MeView(APIView):
    """GET/PATCH/POST /api/accounts/me/ — view or update the logged-in student's profile."""

    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        return Response(UserSerializer(request.user, context={"request": request}).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user, context={"request": request}).data)

    def post(self, request):
        return self.patch(request)


class UserDetailView(generics.RetrieveAPIView):
    """GET /api/accounts/<id>/ — public profile (e.g. seller info before messaging)."""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "user_id"


class DemoUsersView(APIView):
    """GET /api/accounts/demo-users/ — list active demo profiles for easy multi-account switching."""

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        users = User.objects.all().order_by("user_id")
        return Response(UserSerializer(users, many=True, context={"request": request}).data)

