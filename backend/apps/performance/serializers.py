from rest_framework import serializers
from .models import PerformanceCycle, Goal, PerformanceReview

class GoalSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField(source='employee.full_name')
    cycle_title = serializers.ReadOnlyField(source='cycle.title')

    class Meta:
        model = Goal
        fields = '__all__'

class PerformanceReviewSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField(source='employee.full_name')
    emp_id = serializers.ReadOnlyField(source='employee.emp_id')
    department_name = serializers.ReadOnlyField(source='employee.department.name')
    designation_name = serializers.ReadOnlyField(source='employee.designation.name')
    reviewer_name = serializers.ReadOnlyField(source='reviewer.full_name')
    cycle_title = serializers.ReadOnlyField(source='cycle.title')
    avatar_url = serializers.ReadOnlyField(source='employee.avatar_url')

    class Meta:
        model = PerformanceReview
        fields = '__all__'

class PerformanceCycleSerializer(serializers.ModelSerializer):
    goals_count = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()

    class Meta:
        model = PerformanceCycle
        fields = '__all__'

    def get_goals_count(self, obj):
        return obj.goals.count()

    def get_reviews_count(self, obj):
        return obj.reviews.count()
