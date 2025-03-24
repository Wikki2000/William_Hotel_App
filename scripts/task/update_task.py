#!/usr/bin/python3
"""Update vat/cat amount"""
from models import storage
from models.vat import Vat
from models.cat import Cat

tasks = {"cat": Cat, "vat": Vat}
task_type = input("Enter type of task (E.g., Vat/cat: ")
if task_type not in tasks.keys():
    exit("Pleas enter correct options for task (vat or cat)")

task = tasks[task_type](amount=72570, month="march")
storage.new(task)
storage.save()
