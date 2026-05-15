from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from core.models import UserProfile

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'first_name', 'last_name')
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': False},
            'last_name': {'required': False},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    user_type = serializers.CharField(required=True)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        user_type = attrs.get('user_type', '').strip().lower()

        if username and password:
            user = authenticate(request=self.context.get('request'), username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid username or password.')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            if not user_type:
                raise serializers.ValidationError('user_type is required.')
            
            from core.models import USER_TYPE_CHOICES
            valid_user_types = [choice[0] for choice in USER_TYPE_CHOICES]
            if user_type not in valid_user_types:
                raise serializers.ValidationError(
                    f'Invalid user_type. Must be one of: {", ".join(valid_user_types)}'
                )
            try:
                profile = user.profile
                if profile.user_type != user_type:
                    raise serializers.ValidationError(
                        f'Invalid user type. This account is registered as "{profile.user_type}", but you selected "{user_type}".'
                    )
            except UserProfile.DoesNotExist:
                profile = UserProfile.objects.create(user=user, user_type=user_type)
            
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include "username" and "password".')

        return attrs


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'is_active')
        read_only_fields = ('id', 'date_joined', 'is_active')


class LangflowRequestSerializer(serializers.Serializer):
    input_value = serializers.CharField(required=True, help_text="The input message/question for the chat")
    session_id = serializers.CharField(required=False, help_text="Session ID (optional, auto-generated for authenticated users, can be provided for test endpoint)")
    output_type = serializers.CharField(required=False, default="any", help_text="Output type for the response")
    input_type = serializers.CharField(required=False, default="chat", help_text="Input type for the request")
    output_component = serializers.CharField(required=False, default="CustomComponent-YcKiJ", help_text="Output component ID")
    include_generation_raw = serializers.CharField(required=False, default="True", help_text="Include raw generation data")
    include_retrieval_chunks = serializers.CharField(required=False, default="True", help_text="Include retrieval chunks")
    run_id = serializers.CharField(required=False, help_text="Langflow run ID (optional, uses default from settings if not provided)")
    reasoning_mode = serializers.BooleanField(required=False, default=False, help_text="Enable reasoning mode (uses reasoning endpoint if available)")