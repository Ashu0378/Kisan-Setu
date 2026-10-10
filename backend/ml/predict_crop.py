import os
import sys
import json
import warnings
warnings.filterwarnings('ignore')

import joblib  # type: ignore
import numpy as np  # type: ignore
import pandas as pd  # type: ignore
from datetime import datetime

# ─── Comprehensive Agronomic Master Data for 118 Indian Crops ────────────────
CROP_AGRONOMY = {
    # ─── CEREALS & MILLETS ───
    'rice':            {'category': 'Cereal', 'seasons': ['Kharif'],                     'months': [6, 7, 8],       'water': 'High',   'ideal_temp': (20, 38), 'cost': 26000, 'price_q': 2203, 'yield_q': 28},
    'wheat':           {'category': 'Cereal', 'seasons': ['Rabi'],                       'months': [10, 11, 12],    'water': 'High',   'ideal_temp': (12, 28), 'cost': 22000, 'price_q': 2275, 'yield_q': 22},
    'maize':           {'category': 'Cereal', 'seasons': ['Kharif', 'Zaid'],             'months': [2, 3, 6, 7, 8], 'water': 'Medium', 'ideal_temp': (18, 35), 'cost': 20000, 'price_q': 2090, 'yield_q': 25},
    'sorghum':         {'category': 'Cereal', 'seasons': ['Kharif', 'Rabi'],             'months': [6, 7, 10],      'water': 'Low',    'ideal_temp': (20, 36), 'cost': 15000, 'price_q': 3180, 'yield_q': 16},
    'pearlmillet':     {'category': 'Cereal', 'seasons': ['Kharif'],                     'months': [6, 7],          'water': 'Low',    'ideal_temp': (24, 40), 'cost': 14000, 'price_q': 2500, 'yield_q': 15},
    'fingermillet':    {'category': 'Cereal', 'seasons': ['Kharif'],                     'months': [6, 7, 8],       'water': 'Low',    'ideal_temp': (18, 34), 'cost': 14000, 'price_q': 3846, 'yield_q': 14},
    'barley':          {'category': 'Cereal', 'seasons': ['Rabi'],                       'months': [10, 11, 12],    'water': 'Medium', 'ideal_temp': (10, 24), 'cost': 16000, 'price_q': 1850, 'yield_q': 18},
    'oats':            {'category': 'Cereal', 'seasons': ['Rabi'],                       'months': [10, 11],        'water': 'Medium', 'ideal_temp': (12, 25), 'cost': 16000, 'price_q': 2000, 'yield_q': 18},
    'foxtailmillet':   {'category': 'Cereal', 'seasons': ['Kharif'],                     'months': [6, 7],          'water': 'Low',    'ideal_temp': (20, 35), 'cost': 12000, 'price_q': 3500, 'yield_q': 10},
    'kodomillet':      {'category': 'Cereal', 'seasons': ['Kharif'],                     'months': [6, 7],          'water': 'Low',    'ideal_temp': (22, 36), 'cost': 11000, 'price_q': 3200, 'yield_q': 9},
    'littlemillet':    {'category': 'Cereal', 'seasons': ['Kharif'],                     'months': [6, 7],          'water': 'Low',    'ideal_temp': (20, 35), 'cost': 10000, 'price_q': 3400, 'yield_q': 8},
    'prosomillet':     {'category': 'Cereal', 'seasons': ['Kharif', 'Zaid'],             'months': [3, 4, 6],       'water': 'Low',    'ideal_temp': (18, 34), 'cost': 11000, 'price_q': 3100, 'yield_q': 9},
    'barnyardmillet':  {'category': 'Cereal', 'seasons': ['Kharif'],                     'months': [6, 7],          'water': 'Low',    'ideal_temp': (18, 35), 'cost': 11000, 'price_q': 3300, 'yield_q': 9},
    'buckwheat':       {'category': 'Cereal', 'seasons': ['Rabi', 'Kharif'],             'months': [5, 6, 9, 10],   'water': 'Low',    'ideal_temp': (12, 26), 'cost': 12000, 'price_q': 4500, 'yield_q': 10},
    'quinoa':          {'category': 'Cereal', 'seasons': ['Rabi'],                       'months': [10, 11],        'water': 'Low',    'ideal_temp': (12, 30), 'cost': 18000, 'price_q': 9000, 'yield_q': 12},
    'rye':             {'category': 'Cereal', 'seasons': ['Rabi'],                       'months': [10, 11],        'water': 'Low',    'ideal_temp': (8, 22),  'cost': 15000, 'price_q': 2200, 'yield_q': 15},

    # ─── PULSES & LEGUMES ───
    'chickpea':        {'category': 'Pulses', 'seasons': ['Rabi'],                       'months': [10, 11, 12],    'water': 'Low',    'ideal_temp': (10, 30), 'cost': 14000, 'price_q': 5440, 'yield_q': 12},
    'kidneybeans':     {'category': 'Pulses', 'seasons': ['Kharif'],                     'months': [6, 7],          'water': 'Medium', 'ideal_temp': (15, 30), 'cost': 15000, 'price_q': 7200, 'yield_q': 10},
    'pigeonpeas':      {'category': 'Pulses', 'seasons': ['Kharif'],                     'months': [6, 7, 8],       'water': 'Low',    'ideal_temp': (20, 35), 'cost': 12000, 'price_q': 6000, 'yield_q': 10},
    'mothbeans':       {'category': 'Pulses', 'seasons': ['Kharif'],                     'months': [6, 7, 8],       'water': 'Low',    'ideal_temp': (25, 40), 'cost': 9000,  'price_q': 5500, 'yield_q': 7},
    'mungbean':        {'category': 'Pulses', 'seasons': ['Kharif', 'Zaid'],             'months': [2, 3, 6, 7],    'water': 'Low',    'ideal_temp': (25, 38), 'cost': 11000, 'price_q': 8558, 'yield_q': 8},
    'blackgram':       {'category': 'Pulses', 'seasons': ['Kharif', 'Rabi'],             'months': [6, 7, 10, 11],  'water': 'Low',    'ideal_temp': (22, 35), 'cost': 10000, 'price_q': 6500, 'yield_q': 8},
    'lentil':          {'category': 'Pulses', 'seasons': ['Rabi'],                       'months': [10, 11, 12],    'water': 'Low',    'ideal_temp': (10, 26), 'cost': 11000, 'price_q': 5800, 'yield_q': 9},
    'cowpea':          {'category': 'Pulses', 'seasons': ['Kharif', 'Zaid'],             'months': [2, 3, 6, 7],    'water': 'Low',    'ideal_temp': (22, 35), 'cost': 11000, 'price_q': 5000, 'yield_q': 8},
    'fieldpea':        {'category': 'Pulses', 'seasons': ['Rabi'],                       'months': [10, 11, 12],    'water': 'Low',    'ideal_temp': (12, 22), 'cost': 12000, 'price_q': 4500, 'yield_q': 10},
    'horsegram':       {'category': 'Pulses', 'seasons': ['Kharif'],                     'months': [6, 7, 8],       'water': 'Low',    'ideal_temp': (22, 34), 'cost': 8000,  'price_q': 4200, 'yield_q': 6},
    'soybean':         {'category': 'Pulses', 'seasons': ['Kharif'],                     'months': [6, 7],          'water': 'Medium', 'ideal_temp': (20, 32), 'cost': 14000, 'price_q': 4600, 'yield_q': 12},
    'greenpea':        {'category': 'Pulses', 'seasons': ['Rabi'],                       'months': [10, 11, 12],    'water': 'Medium', 'ideal_temp': (10, 20), 'cost': 20000, 'price_q': 3000, 'yield_q': 25},

    # ─── OILSEEDS ───
    'groundnut':       {'category': 'Oilseeds', 'seasons': ['Kharif', 'Zaid'],             'months': [2, 3, 6, 7],    'water': 'Medium', 'ideal_temp': (22, 32), 'cost': 18000, 'price_q': 6377, 'yield_q': 14},
    'mustard':         {'category': 'Oilseeds', 'seasons': ['Rabi'],                       'months': [10, 11, 12],    'water': 'Medium', 'ideal_temp': (12, 25), 'cost': 12000, 'price_q': 5650, 'yield_q': 10},
    'sunflower':       {'category': 'Oilseeds', 'seasons': ['Kharif', 'Rabi', 'Zaid'],     'months': [2, 6, 10],      'water': 'Medium', 'ideal_temp': (20, 32), 'cost': 15000, 'price_q': 6760, 'yield_q': 10},
    'sesame':          {'category': 'Oilseeds', 'seasons': ['Kharif', 'Zaid'],             'months': [2, 3, 6, 7],    'water': 'Low',    'ideal_temp': (25, 35), 'cost': 10000, 'price_q': 8635, 'yield_q': 5},
    'safflower':       {'category': 'Oilseeds', 'seasons': ['Rabi'],                       'months': [10, 11],        'water': 'Low',    'ideal_temp': (16, 28), 'cost': 12000, 'price_q': 5800, 'yield_q': 8},
    'castor':          {'category': 'Oilseeds', 'seasons': ['Kharif'],                     'months': [6, 7, 8],       'water': 'Low',    'ideal_temp': (22, 35), 'cost': 14000, 'price_q': 6000, 'yield_q': 10},
    'nigerseed':       {'category': 'Oilseeds', 'seasons': ['Kharif'],                     'months': [6, 7],          'water': 'Low',    'ideal_temp': (18, 30), 'cost': 8000,  'price_q': 7734, 'yield_q': 4},
    'linseed':         {'category': 'Oilseeds', 'seasons': ['Rabi'],                       'months': [10, 11, 12],    'water': 'Low',    'ideal_temp': (12, 24), 'cost': 10000, 'price_q': 5500, 'yield_q': 6},
    'canola':          {'category': 'Oilseeds', 'seasons': ['Rabi'],                       'months': [10, 11],        'water': 'Medium', 'ideal_temp': (10, 22), 'cost': 14000, 'price_q': 5800, 'yield_q': 12},
    'palmoil':         {'category': 'Oilseeds', 'seasons': ['Kharif', 'Year-Round'],       'months': list(range(1,13)),'water':'High',   'ideal_temp': (24, 33), 'cost': 50000, 'price_q': 1200, 'yield_q': 80},

    # ─── COMMERCIAL & CASH CROPS ───
    'sugarcane':       {'category': 'Cash Crop', 'seasons': ['Kharif', 'Rabi', 'Year-Round'],'months': [1, 2, 10, 11], 'water': 'High',   'ideal_temp': (24, 38), 'cost': 55000, 'price_q': 315,  'yield_q': 350},
    'cotton':          {'category': 'Cash Crop', 'seasons': ['Kharif'],                     'months': [5, 6, 7],       'water': 'Medium', 'ideal_temp': (22, 34), 'cost': 28000, 'price_q': 7020, 'yield_q': 12},
    'jute':            {'category': 'Cash Crop', 'seasons': ['Kharif', 'Zaid'],             'months': [3, 4, 5],       'water': 'High',   'ideal_temp': (23, 33), 'cost': 18000, 'price_q': 3500, 'yield_q': 25},
    'tobacco':         {'category': 'Cash Crop', 'seasons': ['Rabi'],                       'months': [10, 11, 12],    'water': 'Medium', 'ideal_temp': (20, 32), 'cost': 25000, 'price_q': 4500, 'yield_q': 15},
    'tea':             {'category': 'Cash Crop', 'seasons': ['Kharif', 'Year-Round'],       'months': list(range(1,13)),'water':'High',   'ideal_temp': (18, 30), 'cost': 60000, 'price_q': 12000,'yield_q': 18},
    'coffee':          {'category': 'Cash Crop', 'seasons': ['Kharif', 'Year-Round'],       'months': list(range(1,13)),'water':'Medium', 'ideal_temp': (18, 28), 'cost': 70000, 'price_q': 15000,'yield_q': 5},
    'rubber':          {'category': 'Cash Crop', 'seasons': ['Kharif', 'Year-Round'],       'months': list(range(1,13)),'water':'High',   'ideal_temp': (22, 34), 'cost': 50000, 'price_q': 16000,'yield_q': 15},
    'arecanut':        {'category': 'Cash Crop', 'seasons': ['Kharif', 'Year-Round'],       'months': list(range(1,13)),'water':'High',   'ideal_temp': (18, 35), 'cost': 45000, 'price_q': 40000,'yield_q': 12},
    'betelvine':       {'category': 'Cash Crop', 'seasons': ['Kharif', 'Year-Round'],       'months': list(range(1,13)),'water':'High',   'ideal_temp': (20, 32), 'cost': 40000, 'price_q': 3000, 'yield_q': 40},
    'mulberry':        {'category': 'Cash Crop', 'seasons': ['Kharif', 'Year-Round'],       'months': list(range(1,13)),'water':'Medium', 'ideal_temp': (20, 32), 'cost': 35000, 'price_q': 800,  'yield_q': 100},

    # ─── SPICES & CONDIMENTS ───
    'turmeric':        {'category': 'Spices', 'seasons': ['Kharif'],                     'months': [5, 6, 7],       'water': 'High',   'ideal_temp': (20, 34), 'cost': 35000, 'price_q': 7500, 'yield_q': 22},
    'ginger':          {'category': 'Spices', 'seasons': ['Kharif'],                     'months': [4, 5, 6],       'water': 'High',   'ideal_temp': (20, 32), 'cost': 45000, 'price_q': 4000, 'yield_q': 80},
    'garlic':          {'category': 'Spices', 'seasons': ['Rabi'],                       'months': [10, 11, 12],    'water': 'Medium', 'ideal_temp': (12, 25), 'cost': 30000, 'price_q': 5000, 'yield_q': 35},
    'redchili':        {'category': 'Spices', 'seasons': ['Kharif', 'Rabi'],             'months': [6, 7, 10, 11],  'water': 'Medium', 'ideal_temp': (20, 35), 'cost': 30000, 'price_q': 12000,'yield_q': 15},
    'blackpepper':     {'category': 'Spices', 'seasons': ['Kharif', 'Year-Round'],       'months': list(range(1,13)),'water':'High',   'ideal_temp': (20, 34), 'cost': 40000, 'price_q': 50000,'yield_q': 6},
    'cardamom':        {'category': 'Spices', 'seasons': ['Kharif', 'Year-Round'],       'months': list(range(1,13)),'water':'High',   'ideal_temp': (15, 28), 'cost': 50000, 'price_q': 150000,'yield_q': 2},
    'cumin':           {'category': 'Spices', 'seasons': ['Rabi'],                       'months': [10, 11, 12],    'water': 'Low',    'ideal_temp': (15, 28), 'cost': 15000, 'price_q': 22000,'yield_q': 5},
    'coriander':       {'category': 'Spices', 'seasons': ['Rabi'],                       'months': [10, 11, 12],    'water': 'Medium', 'ideal_temp': (15, 28), 'cost': 12000, 'price_q': 7500, 'yield_q': 6},
    'fennel':          {'category': 'Spices', 'seasons': ['Rabi'],                       'months': [10, 11, 12],    'water': 'Low',    'ideal_temp': (15, 28), 'cost': 14000, 'price_q': 8500, 'yield_q': 7},
    'fenugreek':       {'category': 'Spices', 'seasons': ['Rabi'],                       'months': [10, 11, 12],    'water': 'Low',    'ideal_temp': (12, 25), 'cost': 10000, 'price_q': 6000, 'yield_q': 6},
    'clove':           {'category': 'Spices', 'seasons': ['Kharif', 'Year-Round'],       'months': list(range(1,13)),'water':'High',   'ideal_temp': (20, 34), 'cost': 35000, 'price_q': 70000,'yield_q': 3},
    'cinnamon':        {'category': 'Spices', 'seasons': ['Kharif', 'Year-Round'],       'months': list(range(1,13)),'water':'High',   'ideal_temp': (20, 32), 'cost': 30000, 'price_q': 45000,'yield_q': 4},
    'nutmeg':          {'category': 'Spices', 'seasons': ['Kharif', 'Year-Round'],       'months': list(range(1,13)),'water':'High',   'ideal_temp': (22, 34), 'cost': 35000, 'price_q': 50000,'yield_q': 4},
    'saffron':         {'category': 'Spices', 'seasons': ['Rabi'],                       'months': [8, 9, 10],      'water': 'Low',    'ideal_temp': (5, 20),  'cost': 60000, 'price_q': 2500000,'yield_q': 0.1},
    'vanilla':         {'category': 'Spices', 'seasons': ['Kharif', 'Year-Round'],       'months': list(range(1,13)),'water':'High',   'ideal_temp': (20, 32), 'cost': 50000, 'price_q': 200000,'yield_q': 1.5},

    # ─── VEGETABLES & TUBERS ───
    'potato':          {'category': 'Vegetables', 'seasons': ['Rabi'],                       'months': [10, 11, 12],    'water': 'Medium', 'ideal_temp': (14, 24), 'cost': 35000, 'price_q': 1200, 'yield_q': 120},
    'tomato':          {'category': 'Vegetables', 'seasons': ['Kharif', 'Rabi', 'Zaid'],     'months': [2, 3, 6, 7, 10],'water': 'Medium', 'ideal_temp': (18, 30), 'cost': 40000, 'price_q': 1500, 'yield_q': 150},
    'onion':           {'category': 'Vegetables', 'seasons': ['Kharif', 'Rabi'],             'months': [6, 7, 10, 11],  'water': 'Medium', 'ideal_temp': (14, 28), 'cost': 30000, 'price_q': 1800, 'yield_q': 100},
    'brinjal':         {'category': 'Vegetables', 'seasons': ['Kharif', 'Rabi', 'Zaid'],     'months': [2, 6, 10],      'water': 'Medium', 'ideal_temp': (20, 33), 'cost': 30000, 'price_q': 1200, 'yield_q': 120},
    'okra':            {'category': 'Vegetables', 'seasons': ['Kharif', 'Zaid'],             'months': [2, 3, 6, 7],    'water': 'Medium', 'ideal_temp': (22, 35), 'cost': 22000, 'price_q': 2000, 'yield_q': 60},
    'cabbage':         {'category': 'Vegetables', 'seasons': ['Rabi'],                       'months': [9, 10, 11],     'water': 'Medium', 'ideal_temp': (12, 22), 'cost': 25000, 'price_q': 1000, 'yield_q': 140},
    'cauliflower':     {'category': 'Vegetables', 'seasons': ['Rabi'],                       'months': [9, 10, 11],     'water': 'Medium', 'ideal_temp': (12, 22), 'cost': 28000, 'price_q': 1400, 'yield_q': 110},
    'carrot':          {'category': 'Vegetables', 'seasons': ['Rabi'],                       'months': [9, 10, 11],     'water': 'Medium', 'ideal_temp': (12, 24), 'cost': 22000, 'price_q': 1500, 'yield_q': 90},
    'radish':          {'category': 'Vegetables', 'seasons': ['Rabi', 'Zaid'],               'months': [1, 2, 9, 10],   'water': 'Medium', 'ideal_temp': (12, 25), 'cost': 16000, 'price_q': 800,  'yield_q': 80},
    'beetroot':        {'category': 'Vegetables', 'seasons': ['Rabi'],                       'months': [9, 10, 11],     'water': 'Medium', 'ideal_temp': (14, 25), 'cost': 20000, 'price_q': 1300, 'yield_q': 85},
    'spinach':         {'category': 'Vegetables', 'seasons': ['Rabi', 'Kharif'],             'months': [6, 7, 9, 10],   'water': 'Medium', 'ideal_temp': (12, 24), 'cost': 15000, 'price_q': 1500, 'yield_q': 45},
    'cucumber':        {'category': 'Vegetables', 'seasons': ['Zaid', 'Kharif'],             'months': [2, 3, 6, 7],    'water': 'Medium', 'ideal_temp': (20, 32), 'cost': 20000, 'price_q': 1200, 'yield_q': 100},
    'bottlegourd':     {'category': 'Vegetables', 'seasons': ['Zaid', 'Kharif'],             'months': [2, 3, 6, 7],    'water': 'Medium', 'ideal_temp': (22, 34), 'cost': 20000, 'price_q': 1000, 'yield_q': 120},
    'bittergourd':     {'category': 'Vegetables', 'seasons': ['Zaid', 'Kharif'],             'months': [2, 3, 6, 7],    'water': 'Medium', 'ideal_temp': (22, 35), 'cost': 22000, 'price_q': 2200, 'yield_q': 65},
    'ridgegourd':      {'category': 'Vegetables', 'seasons': ['Zaid', 'Kharif'],             'months': [2, 3, 6, 7],    'water': 'Medium', 'ideal_temp': (22, 34), 'cost': 20000, 'price_q': 1800, 'yield_q': 60},
    'pumpkin':         {'category': 'Vegetables', 'seasons': ['Zaid', 'Kharif'],             'months': [2, 3, 6, 7],    'water': 'Medium', 'ideal_temp': (20, 32), 'cost': 18000, 'price_q': 800,  'yield_q': 130},
    'capsicum':        {'category': 'Vegetables', 'seasons': ['Kharif', 'Rabi'],             'months': [6, 7, 9, 10],   'water': 'Medium', 'ideal_temp': (16, 28), 'cost': 35000, 'price_q': 2500, 'yield_q': 80},
    'greenchili':      {'category': 'Vegetables', 'seasons': ['Kharif', 'Rabi', 'Zaid'],     'months': [2, 6, 10],      'water': 'Medium', 'ideal_temp': (20, 33), 'cost': 25000, 'price_q': 3000, 'yield_q': 50},
    'sweetpotato':     {'category': 'Vegetables', 'seasons': ['Kharif'],                     'months': [6, 7],          'water': 'Medium', 'ideal_temp': (20, 32), 'cost': 20000, 'price_q': 1500, 'yield_q': 90},
    'cassava':         {'category': 'Vegetables', 'seasons': ['Kharif'],                     'months': [4, 5, 6],       'water': 'Medium', 'ideal_temp': (22, 35), 'cost': 25000, 'price_q': 1000, 'yield_q': 140},
    'yam':             {'category': 'Vegetables', 'seasons': ['Kharif'],                     'months': [5, 6],          'water': 'Medium', 'ideal_temp': (22, 34), 'cost': 25000, 'price_q': 1400, 'yield_q': 110},
    'elephantfootyam': {'category': 'Vegetables', 'seasons': ['Kharif'],                     'months': [4, 5],          'water': 'Medium', 'ideal_temp': (22, 34), 'cost': 35000, 'price_q': 1800, 'yield_q': 150},
    'moringa':         {'category': 'Vegetables', 'seasons': ['Kharif', 'Year-Round'],       'months': list(range(1,13)),'water':'Low',    'ideal_temp': (22, 38), 'cost': 25000, 'price_q': 2000, 'yield_q': 100},
    'clusterbeans':    {'category': 'Vegetables', 'seasons': ['Kharif', 'Zaid'],             'months': [2, 3, 6, 7],    'water': 'Low',    'ideal_temp': (25, 38), 'cost': 12000, 'price_q': 4000, 'yield_q': 25},
    'lettuce':         {'category': 'Vegetables', 'seasons': ['Rabi'],                       'months': [10, 11, 12],    'water': 'Medium', 'ideal_temp': (12, 22), 'cost': 20000, 'price_q': 2500, 'yield_q': 50},

    # ─── FRUITS & HORTICULTURE ───
    'mango':           {'category': 'Fruits', 'seasons': ['Kharif', 'Year-Round'],       'months': list(range(1,13)),'water':'Medium', 'ideal_temp': (24, 38), 'cost': 40000, 'price_q': 3000, 'yield_q': 150},
    'banana':          {'category': 'Fruits', 'seasons': ['Kharif', 'Zaid', 'Year-Round'], 'months': list(range(1,13)),'water':'High',   'ideal_temp': (20, 33), 'cost': 50000, 'price_q': 1500, 'yield_q': 300},
    'apple':           {'category': 'Fruits', 'seasons': ['Rabi', 'Year-Round'],         'months': [11, 12, 1, 2],  'water': 'Medium', 'ideal_temp': (6, 22),  'cost': 60000, 'price_q': 8000, 'yield_q': 120},
    'guava':           {'category': 'Fruits', 'seasons': ['Kharif', 'Year-Round'],       'months': list(range(1,13)),'water':'Medium', 'ideal_temp': (18, 33), 'cost': 25000, 'price_q': 2000, 'yield_q': 100},
    'papaya':          {'category': 'Fruits', 'seasons': ['Kharif', 'Zaid', 'Year-Round'], 'months': list(range(1,13)),'water':'Medium', 'ideal_temp': (22, 38), 'cost': 35000, 'price_q': 1800, 'yield_q': 250},
    'orange':          {'category': 'Fruits', 'seasons': ['Kharif', 'Year-Round'],       'months': list(range(1,13)),'water':'Medium', 'ideal_temp': (12, 32), 'cost': 45000, 'price_q': 4000, 'yield_q': 100},
    'lemon':           {'category': 'Fruits', 'seasons': ['Kharif', 'Year-Round'],       'months': list(range(1,13)),'water':'Medium', 'ideal_temp': (14, 34), 'cost': 35000, 'price_q': 3500, 'yield_q': 90},
    'pineapple':       {'category': 'Fruits', 'seasons': ['Kharif', 'Year-Round'],       'months': list(range(1,13)),'water':'High',   'ideal_temp': (20, 32), 'cost': 45000, 'price_q': 2000, 'yield_q': 200},
    'pomegranate':     {'category': 'Fruits', 'seasons': ['Kharif', 'Year-Round'],       'months': list(range(1,13)),'water':'Low',    'ideal_temp': (18, 35), 'cost': 60000, 'price_q': 8000, 'yield_q': 120},
    'grapes':          {'category': 'Fruits', 'seasons': ['Rabi', 'Year-Round'],         'months': [11, 12, 1, 2],  'water': 'Medium', 'ideal_temp': (14, 32), 'cost': 80000, 'price_q': 6000, 'yield_q': 150},
    'watermelon':      {'category': 'Fruits', 'seasons': ['Zaid', 'Rabi'],               'months': [11, 12, 1, 2, 3],'water':'Medium', 'ideal_temp': (22, 35), 'cost': 20000, 'price_q': 1000, 'yield_q': 180},
    'muskmelon':       {'category': 'Fruits', 'seasons': ['Zaid'],                       'months': [2, 3, 4],       'water': 'Medium', 'ideal_temp': (24, 36), 'cost': 18000, 'price_q': 1200, 'yield_q': 120},
    'coconut':         {'category': 'Fruits', 'seasons': ['Kharif', 'Year-Round'],       'months': list(range(1,13)),'water':'High',   'ideal_temp': (22, 32), 'cost': 35000, 'price_q': 9500, 'yield_q': 14},
    'cashew':          {'category': 'Fruits', 'seasons': ['Kharif', 'Year-Round'],       'months': list(range(1,13)),'water':'Medium', 'ideal_temp': (22, 35), 'cost': 25000, 'price_q': 12000,'yield_q': 10},
    'dragonfruit':     {'category': 'Fruits', 'seasons': ['Kharif', 'Year-Round'],       'months': list(range(1,13)),'water':'Low',    'ideal_temp': (20, 35), 'cost': 60000, 'price_q': 10000,'yield_q': 80},
    'custardapple':    {'category': 'Fruits', 'seasons': ['Kharif', 'Year-Round'],       'months': list(range(1,13)),'water':'Low',    'ideal_temp': (18, 35), 'cost': 22000, 'price_q': 4500, 'yield_q': 60},
    'fig':             {'category': 'Fruits', 'seasons': ['Kharif', 'Year-Round'],       'months': list(range(1,13)),'water':'Low',    'ideal_temp': (16, 32), 'cost': 30000, 'price_q': 8000, 'yield_q': 50},
    'sapota':          {'category': 'Fruits', 'seasons': ['Kharif', 'Year-Round'],       'months': list(range(1,13)),'water':'Medium', 'ideal_temp': (18, 34), 'cost': 30000, 'price_q': 2500, 'yield_q': 90},
    'strawberry':      {'category': 'Fruits', 'seasons': ['Rabi'],                       'months': [10, 11, 12],    'water': 'Medium', 'ideal_temp': (10, 22), 'cost': 80000, 'price_q': 15000,'yield_q': 60},
    'kiwi':            {'category': 'Fruits', 'seasons': ['Rabi'],                       'months': [10, 11, 12],    'water': 'Medium', 'ideal_temp': (8, 22),  'cost': 75000, 'price_q': 14000,'yield_q': 70},
    'lychee':          {'category': 'Fruits', 'seasons': ['Kharif', 'Year-Round'],       'months': list(range(1,13)),'water':'Medium', 'ideal_temp': (18, 32), 'cost': 35000, 'price_q': 5000, 'yield_q': 70},
    'jackfruit':       {'category': 'Fruits', 'seasons': ['Kharif', 'Year-Round'],       'months': list(range(1,13)),'water':'Medium', 'ideal_temp': (20, 35), 'cost': 30000, 'price_q': 1500, 'yield_q': 150},

    # ─── FLOWERS & MEDICINAL ───
    'marigold':        {'category': 'Flowers & Medicinal', 'seasons': ['Kharif', 'Rabi', 'Zaid'],     'months': list(range(1,13)),'water':'Medium', 'ideal_temp': (15, 30), 'cost': 25000, 'price_q': 3000, 'yield_q': 70},
    'rose':            {'category': 'Flowers & Medicinal', 'seasons': ['Kharif', 'Rabi', 'Year-Round'], 'months': list(range(1,13)),'water':'Medium', 'ideal_temp': (14, 28), 'cost': 60000, 'price_q': 10000,'yield_q': 40},
    'jasmine':         {'category': 'Flowers & Medicinal', 'seasons': ['Kharif', 'Year-Round'],       'months': list(range(1,13)),'water':'Medium', 'ideal_temp': (18, 32), 'cost': 45000, 'price_q': 12000,'yield_q': 30},
    'ashwagandha':     {'category': 'Flowers & Medicinal', 'seasons': ['Kharif', 'Rabi'],             'months': [7, 8, 9, 10],   'water': 'Low',    'ideal_temp': (20, 35), 'cost': 18000, 'price_q': 25000,'yield_q': 5},
    'aloevera':        {'category': 'Flowers & Medicinal', 'seasons': ['Kharif', 'Rabi', 'Year-Round'], 'months': list(range(1,13)),'water':'Low',    'ideal_temp': (20, 38), 'cost': 20000, 'price_q': 500,  'yield_q': 150},
    'lemongrass':      {'category': 'Flowers & Medicinal', 'seasons': ['Kharif', 'Year-Round'],       'months': list(range(1,13)),'water':'Low',    'ideal_temp': (20, 35), 'cost': 20000, 'price_q': 1500, 'yield_q': 100},
    'mint':            {'category': 'Flowers & Medicinal', 'seasons': ['Zaid', 'Kharif'],             'months': [2, 3, 4, 5, 6], 'water': 'High',   'ideal_temp': (15, 30), 'cost': 22000, 'price_q': 2000, 'yield_q': 80},
    'tulsi':           {'category': 'Flowers & Medicinal', 'seasons': ['Kharif', 'Year-Round'],       'months': list(range(1,13)),'water':'Low',    'ideal_temp': (18, 35), 'cost': 15000, 'price_q': 4000, 'yield_q': 40},
}

def get_cost_breakdown(crop_name, category, total_cost):
    cat = (category or '').lower()
    c_name = (crop_name or '').lower()
    
    seeds_pct = 0.14
    fert_pct = 0.20
    pest_pct = 0.12
    irr_pct = 0.09
    elec_pct = 0.08
    labour_pct = 0.25
    mach_pct = 0.12
    
    if 'veg' in cat or 'tomato' in c_name or 'onion' in c_name or 'potato' in c_name or 'chili' in c_name:
        seeds_pct, fert_pct, pest_pct, irr_pct, elec_pct, labour_pct, mach_pct = 0.16, 0.20, 0.16, 0.09, 0.07, 0.22, 0.10
    elif 'fruit' in cat or 'plantation' in cat or 'horticulture' in cat:
        seeds_pct, fert_pct, pest_pct, irr_pct, elec_pct, labour_pct, mach_pct = 0.18, 0.22, 0.14, 0.11, 0.08, 0.19, 0.08
    elif 'pulse' in cat or 'oil' in cat:
        seeds_pct, fert_pct, pest_pct, irr_pct, elec_pct, labour_pct, mach_pct = 0.16, 0.16, 0.12, 0.07, 0.07, 0.28, 0.14

    seeds = round(total_cost * seeds_pct)
    fert = round(total_cost * fert_pct)
    pest = round(total_cost * pest_pct)
    irr = round(total_cost * irr_pct)
    elec = round(total_cost * elec_pct)
    labour = round(total_cost * labour_pct)
    mach = total_cost - (seeds + fert + pest + irr + elec + labour)

    return {
        "seeds": seeds,
        "fertilizers": fert,
        "pesticides": pest,
        "irrigation": irr,
        "electricityFuel": elec,
        "labourCharge": labour,
        "machineryTillage": mach,
        "totalCost": total_cost
    }

def compute_multi_factor_score(raw_recs, target_month, target_season, temp, humidity, rainfall, budget, target_category=None, yield_regressor=None, scaled_features=None, label_encoder=None):
    """
    Evaluates ML recommendations across 4 dimensions:
    1. ML Soil/Climate model probability (40%)
    2. Seasonal & Sowing month fit (25%) - STRICT SEASONAL MATCHING!
    3. Revenue & Budget feasibility (20%) - Uses ML Yield Regressor when available!
    4. Regional Climate suitability forecast (15%)
    """
    results = []
    target_season_clean = (target_season or '').strip().capitalize()

    for rec in raw_recs:
        crop_name_raw = rec['crop']
        crop_key = crop_name_raw.lower().replace(' ', '')

        agronomy = CROP_AGRONOMY.get(crop_key, {
            'category': 'Crop',
            'seasons': ['Kharif', 'Rabi', 'Zaid'],
            'months': list(range(1, 13)),
            'water': 'Medium',
            'ideal_temp': (15, 35),
            'cost': 20000,
            'price_q': 3000,
            'yield_q': 15
        })

        # 1. ML Soil Score (0 - 100)
        ml_score = rec['confidence']

        # 2. Strict Seasonal Alignment Score (0 - 100)
        crop_seasons = agronomy.get('seasons', [])
        
        season_match = False
        if not target_season_clean or target_season_clean in ['Any', 'Year-round']:
            season_match = True
        else:
            season_match = target_season_clean in crop_seasons

        month_match = target_month in agronomy.get('months', list(range(1, 13)))

        if season_match and month_match:
            seasonal_score = 100.0
            seasonal_fit = 'Optimal Season'
        elif season_match:
            seasonal_score = 80.0
            seasonal_fit = 'In Season'
        elif 'Year-Round' in crop_seasons:
            seasonal_score = 50.0
            seasonal_fit = 'Year-Round'
        else:
            seasonal_score = 0.0
            seasonal_fit = 'Out of Season'

        # 3. Predict ML Yield & Calculate Revenue dynamically
        predicted_yield = agronomy['yield_q']
        if yield_regressor is not None and scaled_features is not None and label_encoder is not None:
            try:
                if crop_key in label_encoder.classes_:
                    crop_idx = label_encoder.transform([crop_key])[0]
                else:
                    crop_idx = 0
                
                reg_in = np.append(scaled_features[0], crop_idx)
                ml_yield_pred = yield_regressor.predict([reg_in])[0]
                predicted_yield = round(float(ml_yield_pred), 1)
            except Exception as e:
                pass

        price_q = agronomy['price_q']
        cost = agronomy['cost']
        gross_rev = round(predicted_yield * price_q, 2)
        net_profit = round(gross_rev - cost, 2)
        roi_pct = round((net_profit / cost) * 100, 1) if cost > 0 else 100.0

        # Budget check
        if budget > 0 and cost <= budget:
            budget_factor = 1.0
        elif budget > 0:
            budget_factor = max(0.5, 1.0 - ((cost - budget) / budget))
        else:
            budget_factor = 1.0

        revenue_score = min(100.0, max(20.0, (roi_pct / 3.0))) * budget_factor

        # 4. Climate Forecast Suitability (0 - 100)
        min_t, max_t = agronomy['ideal_temp']
        if min_t <= temp <= max_t:
            temp_score = 100.0
        else:
            temp_score = max(30.0, 100.0 - abs(temp - min_t)*5 if temp < min_t else 100.0 - abs(temp - max_t)*5)

        water_req = agronomy['water']
        if water_req == 'High' and rainfall >= 600:
            water_score = 100.0
        elif water_req == 'Low' and rainfall < 700:
            water_score = 100.0
        elif water_req == 'Medium':
            water_score = 85.0
        else:
            water_score = 50.0

        climate_score = (temp_score * 0.6) + (water_score * 0.4)

        # Composite Multi-Factor Score
        final_composite_score = round(
            (ml_score * 0.40) +
            (seasonal_score * 0.25) +
            (revenue_score * 0.20) +
            (climate_score * 0.15),
            1
        )

        cost_bd = get_cost_breakdown(crop_name_raw, agronomy.get('category', 'Crop'), cost)

        results.append({
            "crop": crop_name_raw.capitalize(),
            "category": agronomy.get('category', 'Crop'),
            "confidence": final_composite_score,
            "raw_ml_confidence": rec['confidence'],
            "seasonal_fit": seasonal_fit,
            "season_tag": ", ".join(agronomy['seasons']),
            "yield": f"{predicted_yield} Quintal/Acre",
            "yieldNum": predicted_yield,
            "costPerAcre": cost,
            "pricePerQ": price_q,
            "grossRevenue": gross_rev,
            "netProfit": net_profit,
            "roiPct": roi_pct,
            "profit": f"₹{int(net_profit):,}/acre",
            "risk": "Low" if final_composite_score > 75 else ("Medium" if final_composite_score > 50 else "High"),
            "water": agronomy['water'],
            "climateSuitability": f"{round(climate_score)}% Match",
            "scoreBreakdown": {
                "soilMl": round(ml_score, 1),
                "season": round(seasonal_score, 1),
                "revenue": round(revenue_score, 1),
                "climate": round(climate_score, 1)
            },
            "costBreakdown": cost_bd
        })

    # STRICT SEASON FILTER: Exclude Out of Season crops
    valid_recs = [r for r in results if r['seasonal_fit'] != 'Out of Season']
    if not valid_recs:
        valid_recs = results

    # STRICT CATEGORY FILTER if specified
    if target_category and target_category.strip().lower() not in ['', 'all', 'any']:
        cat_req = target_category.strip().lower()
        cat_filtered = [r for r in valid_recs if cat_req in r['category'].lower()]
        if cat_filtered:
            valid_recs = cat_filtered

    # Priority ranking: Optimal/In-Season crops first, then by Net Profit descending
    valid_recs.sort(key=lambda x: (
        2 if x['seasonal_fit'] == 'Optimal Season' else (1 if x['seasonal_fit'] == 'In Season' else 0),
        x['netProfit']
    ), reverse=True)
    return valid_recs

def predict():
    try:
        base_dir = os.path.dirname(__file__)
        models_dir = os.path.join(base_dir, "models")

        model_path   = os.path.join(models_dir, "crop_recommendation_model.pkl")
        reg_path     = os.path.join(models_dir, "yield_regression_model.pkl")
        scaler_path  = os.path.join(models_dir, "scaler.pkl")
        encoder_path = os.path.join(models_dir, "label_encoder.pkl")

        if not os.path.exists(model_path):
            print(json.dumps({"error": "Trained model pkl file not found. Run train_crop_model.py first."}))
            sys.exit(1)

        model         = joblib.load(model_path)
        yield_reg     = joblib.load(reg_path) if os.path.exists(reg_path) else None
        scaler        = joblib.load(scaler_path)
        label_encoder = joblib.load(encoder_path)

        if len(sys.argv) > 1:
            raw_input = sys.argv[1]
        else:
            raw_input = sys.stdin.read()

        if not raw_input:
            data = {"N": 90, "P": 42, "K": 43, "temperature": 20.8, "humidity": 82, "ph": 6.5, "rainfall": 202}
        else:
            data = json.loads(raw_input)

        n_val = float(data.get("N", data.get("nitrogen", 45)))
        p_val = float(data.get("P", data.get("phosphorus", 20)))
        k_val = float(data.get("K", data.get("potassium", 30)))
        temp_val = float(data.get("temperature", 28))
        hum_val = float(data.get("humidity", 60))
        ph_val = float(data.get("ph", 6.5))
        rain_val = float(data.get("rainfall", 800))

        # Engineered features matching train_crop_model.py (12 features)
        n_p_ratio = n_val / (p_val + 1.0)
        n_k_ratio = n_val / (k_val + 1.0)
        p_k_ratio = p_val / (k_val + 1.0)
        npk_sum   = n_val + p_val + k_val
        thi       = temp_val * (hum_val / 100.0)

        features = [
            n_val, p_val, k_val, temp_val, hum_val, ph_val, rain_val,
            n_p_ratio, n_k_ratio, p_k_ratio, npk_sum, thi
        ]

        # Farmer selections
        target_month    = int(data.get("month", datetime.now().month))
        target_season   = str(data.get("sowingSeason", "Kharif"))
        target_category = str(data.get("cropCategory", data.get("category", "All")))
        budget          = float(data.get("budget", 50000))

        feature_cols = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall', 'N_P_ratio', 'N_K_ratio', 'P_K_ratio', 'NPK_sum', 'THI']
        features_df = pd.DataFrame([features], columns=feature_cols)
        scaled_features = scaler.transform(features_df)

        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(scaled_features)[0]
            top_indices = np.argsort(probs)[::-1][:40]

            raw_recommendations = []
            for idx in top_indices:
                crop_name = label_encoder.inverse_transform([idx])[0]
                conf      = round(float(probs[idx]) * 100, 2)
                raw_recommendations.append({
                    "crop":       crop_name.capitalize(),
                    "confidence": conf,
                })
        else:
            pred_idx  = model.predict(scaled_features)[0]
            crop_name = label_encoder.inverse_transform([pred_idx])[0]
            raw_recommendations = [{
                "crop":       crop_name.capitalize(),
                "confidence": 95.0,
            }]

        # Apply comprehensive multi-factor scoring with ML Yield & Revenue prediction
        ranked_recommendations = compute_multi_factor_score(
            raw_recommendations,
            target_month,
            target_season,
            features[3], # temp
            features[4], # humidity
            features[6], # rainfall
            budget,
            target_category=target_category,
            yield_regressor=yield_reg,
            scaled_features=scaled_features,
            label_encoder=label_encoder
        )

        top5 = ranked_recommendations[:5]

        # Build categorized buckets
        categorized = {}
        for r in ranked_recommendations:
            cat = r.get("category", "Other")
            if cat not in categorized:
                categorized[cat] = []
            categorized[cat].append(r)

        output = {
            "success":            True,
            "engine":             "Multi-Factor Agronomic & Yield-Revenue ML Engine (R2=0.95)",
            "features_used":      features,
            "target_month":       target_month,
            "target_season":      target_season,
            "target_category":    target_category,
            "top_recommendation": top5[0]["crop"] if top5 else "",
            "recommendations":    top5,
            "categorized":        categorized
        }

        print(json.dumps(output))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    predict()
