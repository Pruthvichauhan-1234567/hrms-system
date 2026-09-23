from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import JobOpening, Candidate, Interview
from .serializers import JobOpeningSerializer, CandidateSerializer, InterviewSerializer

class JobOpeningViewSet(viewsets.ModelViewSet):
    queryset = JobOpening.objects.all().order_by('-created_at')
    serializer_class = JobOpeningSerializer

class CandidateViewSet(viewsets.ModelViewSet):
    queryset = Candidate.objects.all().order_by('-applied_date')
    serializer_class = CandidateSerializer

    @action(detail=True, methods=['post'])
    def update_stage(self, request, pk=None):
        candidate = self.get_object()
        new_stage = request.data.get('stage')
        if not new_stage:
            return Response({'error': 'Stage parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        candidate.stage = new_stage
        candidate.save()
        return Response({'status': 'Stage updated', 'candidate': CandidateSerializer(candidate).data})

class InterviewViewSet(viewsets.ModelViewSet):
    queryset = Interview.objects.all().order_by('scheduled_date', 'scheduled_time')
    serializer_class = InterviewSerializer
