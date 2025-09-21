from django.contrib import admin
from .models import Meal

# Register your models here.

@admin.register(Meal)

class MealAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'is_available', 'prep_time', 'created_at', 'updated_at')
    list_filter = list_filter = ['is_available']
    search_fields = ('name', 'description')
    ordering = ('name',)