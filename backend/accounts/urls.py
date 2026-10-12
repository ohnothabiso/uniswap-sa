from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import MeView, RegisterView, UniversityListView, UserDetailView, DemoUsersView
from .token_views import EmailTokenObtainPairView

app_name = "accounts"

urlpatterns = [
    path("universities/", UniversityListView.as_view(), name="universities"),
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", EmailTokenObtainPairView.as_view(), name="login"),
    path("login/refresh/", TokenRefreshView.as_view(), name="login_refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("users/", DemoUsersView.as_view(), name="user_list"),
    path("demo-users/", DemoUsersView.as_view(), name="demo_users"),
    path("<int:user_id>/", UserDetailView.as_view(), name="user_detail"),
]
