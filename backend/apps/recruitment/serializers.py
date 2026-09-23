from rest_framework import serializers
from .models import JobOpening, Candidate, Interview

class JobOpeningSerializer(serializers.ModelSerializer):
    department_name = serializers.ReadOnlyField(source='department.name')
    designation_name = serializers.ReadOnlyField(source='designation.name')
    location_name = serializers.ReadOnlyField(source='location.name')
    candidates_count = serializers.SerializerMethodField()

    class Meta:
        model = JobOpening
        fields = '__all__'

    def get_candidates_count(self, obj):
        return obj.candidates.count()

class InterviewSerializer(serializers.ModelSerializer):
    candidate_name = serializers.ReadOnlyField(source='candidate.name')
    interviewer_name = serializers.ReadOnlyField(source='interviewer.full_name')

    class Meta:
        model = Interview
        fields = '__all__'

class CandidateSerializer(serializers.ModelSerializer):
    job_title = serializers.ReadOnlyField(source='job_opening.title')
    department_name = serializers.ReadOnlyField(source='job_opening.department.name')
    interviews = InterviewSerializer(many=True, read_only=True)

    class Meta:
        model = Candidate
        fields = '__all__'
