from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import PerformanceCycle, Goal, PerformanceReview
from .serializers import PerformanceCycleSerializer, GoalSerializer, PerformanceReviewSerializer

class PerformanceCycleViewSet(viewsets.ModelViewSet):
    queryset = PerformanceCycle.objects.all().order_by('-start_date')
    serializer_class = PerformanceCycleSerializer

class GoalViewSet(viewsets.ModelViewSet):
    queryset = Goal.objects.all().order_by('-created_at')
    serializer_class = GoalSerializer

    def get_queryset(self):
        qs = Goal.objects.all().select_related('employee', 'cycle')
        emp_id = self.request.query_params.get('employee_id', None)
        cycle_id = self.request.query_params.get('cycle_id', None)
        status_filter = self.request.query_params.get('status', None)

        if emp_id:
            qs = qs.filter(employee__id=emp_id)
        if cycle_id:
            qs = qs.filter(cycle__id=cycle_id)
        if status_filter and status_filter != 'All':
            qs = qs.filter(status=status_filter)

        return qs

    @action(detail=True, methods=['patch', 'post'])
    def update_progress(self, request, pk=None):
        goal = self.get_object()
        progress = int(request.data.get('progress', goal.progress))
        goal.progress = max(0, min(100, progress))
        if goal.progress == 100:
            goal.status = 'Completed'
        elif goal.progress >= 50:
            goal.status = 'On Track'
        goal.save()
        return Response({'status': 'Goal progress updated', 'goal': GoalSerializer(goal).data})

class PerformanceReviewViewSet(viewsets.ModelViewSet):
    queryset = PerformanceReview.objects.all().order_by('-review_date')
    serializer_class = PerformanceReviewSerializer

    def get_queryset(self):
        qs = PerformanceReview.objects.all().select_related('employee', 'reviewer', 'cycle')
        emp_id = self.request.query_params.get('employee_id', None)
        if emp_id:
            qs = qs.filter(employee__id=emp_id)
        return qs
