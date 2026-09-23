from rest_framework import viewsets
from rest_framework.response import Response
from .models import Document
from .serializers import DocumentSerializer

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all().order_by('-uploaded_at')
    serializer_class = DocumentSerializer

    def get_queryset(self):
        qs = Document.objects.all().select_related('employee')
        emp_id = self.request.query_params.get('employee_id', None)
        doc_type = self.request.query_params.get('type', None)
        is_company = self.request.query_params.get('company_wide', None)

        if emp_id:
            qs = qs.filter(employee__id=emp_id)
        if doc_type and doc_type != 'All':
            qs = qs.filter(document_type=doc_type)
        if is_company is not None:
            qs = qs.filter(is_company_wide=(is_company.lower() == 'true'))

        return qs
