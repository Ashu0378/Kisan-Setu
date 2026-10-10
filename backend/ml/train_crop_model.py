import os
import json
import joblib  # type: ignore
import numpy as np  # type: ignore
import pandas as pd  # type: ignore

from sklearn.model_selection import train_test_split  # type: ignore
from sklearn.preprocessing import StandardScaler, LabelEncoder  # type: ignore
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor  # type: ignore
from sklearn.metrics import accuracy_score, mean_absolute_error, r2_score  # type: ignore

# -----------------------------------------------------------------------------
# 1. High-Accuracy Dataset Generation (118 Crops with Feature Engineering)
# -----------------------------------------------------------------------------
CEREAL_CROPS = {
    'rice', 'wheat', 'maize', 'sorghum', 'pearlmillet', 'fingermillet',
    'barley', 'oats', 'foxtailmillet', 'kodomillet', 'littlemillet',
    'prosomillet', 'barnyardmillet', 'buckwheat', 'quinoa', 'rye'
}

def extract_engineered_features(df):
    """
    Computes agronomic ratios and interaction terms for high ML classification accuracy.
    """
    df = df.copy()
    df['N_P_ratio'] = df['N'] / (df['P'] + 1.0)
    df['N_K_ratio'] = df['N'] / (df['K'] + 1.0)
    df['P_K_ratio'] = df['P'] / (df['K'] + 1.0)
    df['NPK_sum']   = df['N'] + df['P'] + df['K']
    df['THI']       = df['temperature'] * (df['humidity'] / 100.0)
    return df

FEATURE_COLS = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall', 'N_P_ratio', 'N_K_ratio', 'P_K_ratio', 'NPK_sum', 'THI']

def load_or_generate_dataset(filepath="Crop_recommendation.csv", force_regenerate=True):
    if os.path.exists(filepath) and not force_regenerate:
        print(f"[*] Loading existing dataset from: {filepath}")
        df = pd.read_csv(filepath)
    else:
        print("[*] Generating High-Accuracy Agronomic & Revenue Dataset...")
        np.random.seed(42)
        
        crop_profiles = {
            # ─── CEREALS & MILLETS (Core Focus) ───
            'rice':            {'N': (80, 120), 'P': (35, 60),  'K': (35, 45),  'temp': (20, 32), 'humidity': (80, 88), 'ph': (6.0, 7.0), 'rainfall': (180, 300), 'base_yield': 28, 'cost': 26000, 'price_q': 2203},
            'wheat':           {'N': (60, 100), 'P': (35, 55),  'K': (25, 40),  'temp': (12, 25), 'humidity': (50, 70), 'ph': (6.0, 7.5), 'rainfall': (50, 100),  'base_yield': 22, 'cost': 22000, 'price_q': 2275},
            'maize':           {'N': (60, 100), 'P': (35, 60),  'K': (15, 25),  'temp': (18, 30), 'humidity': (55, 75), 'ph': (5.5, 7.0), 'rainfall': (60, 110),  'base_yield': 25, 'cost': 20000, 'price_q': 2090},
            'sorghum':         {'N': (40, 80),  'P': (20, 40),  'K': (20, 35),  'temp': (25, 35), 'humidity': (40, 65), 'ph': (6.0, 8.0), 'rainfall': (40, 80),   'base_yield': 16, 'cost': 15000, 'price_q': 3180},
            'pearlmillet':     {'N': (30, 60),  'P': (15, 30),  'K': (15, 30),  'temp': (26, 38), 'humidity': (30, 60), 'ph': (6.5, 8.5), 'rainfall': (30, 60),   'base_yield': 15, 'cost': 14000, 'price_q': 2500},
            'fingermillet':    {'N': (30, 60),  'P': (15, 35),  'K': (15, 30),  'temp': (20, 32), 'humidity': (50, 75), 'ph': (5.5, 7.5), 'rainfall': (50, 90),   'base_yield': 14, 'cost': 14000, 'price_q': 3846},
            'barley':          {'N': (40, 70),  'P': (20, 40),  'K': (20, 35),  'temp': (12, 22), 'humidity': (45, 65), 'ph': (6.0, 7.5), 'rainfall': (40, 75),   'base_yield': 18, 'cost': 16000, 'price_q': 1850},
            'oats':            {'N': (40, 75),  'P': (20, 40),  'K': (20, 35),  'temp': (14, 24), 'humidity': (50, 70), 'ph': (5.8, 7.2), 'rainfall': (50, 85),   'base_yield': 18, 'cost': 16000, 'price_q': 2000},
            'foxtailmillet':   {'N': (25, 50),  'P': (15, 30),  'K': (15, 30),  'temp': (22, 34), 'humidity': (35, 60), 'ph': (5.5, 7.5), 'rainfall': (35, 65),   'base_yield': 10, 'cost': 12000, 'price_q': 3500},
            'kodomillet':      {'N': (20, 45),  'P': (15, 25),  'K': (15, 25),  'temp': (24, 35), 'humidity': (35, 60), 'ph': (5.5, 7.8), 'rainfall': (30, 60),   'base_yield': 9,  'cost': 11000, 'price_q': 3200},
            'littlemillet':    {'N': (20, 40),  'P': (15, 25),  'K': (15, 25),  'temp': (22, 34), 'humidity': (40, 65), 'ph': (5.5, 7.5), 'rainfall': (40, 70),   'base_yield': 8,  'cost': 10000, 'price_q': 3400},
            'prosomillet':     {'N': (20, 45),  'P': (15, 25),  'K': (15, 25),  'temp': (20, 32), 'humidity': (35, 60), 'ph': (5.8, 7.5), 'rainfall': (30, 55),   'base_yield': 9,  'cost': 11000, 'price_q': 3100},
            'barnyardmillet':  {'N': (20, 45),  'P': (15, 25),  'K': (15, 25),  'temp': (20, 33), 'humidity': (40, 65), 'ph': (5.5, 7.5), 'rainfall': (40, 70),   'base_yield': 9,  'cost': 11000, 'price_q': 3300},
            'buckwheat':       {'N': (20, 40),  'P': (20, 35),  'K': (20, 35),  'temp': (15, 25), 'humidity': (55, 75), 'ph': (5.0, 7.0), 'rainfall': (50, 90),   'base_yield': 10, 'cost': 12000, 'price_q': 4500},
            'quinoa':          {'N': (30, 60),  'P': (20, 40),  'K': (20, 40),  'temp': (15, 28), 'humidity': (40, 65), 'ph': (6.0, 8.0), 'rainfall': (35, 70),   'base_yield': 12, 'cost': 18000, 'price_q': 9000},
            'rye':             {'N': (35, 65),  'P': (20, 35),  'K': (20, 35),  'temp': (10, 20), 'humidity': (50, 70), 'ph': (5.5, 7.0), 'rainfall': (45, 80),   'base_yield': 15, 'cost': 15000, 'price_q': 2200},

            # ─── PULSES & LEGUMES ───
            'chickpea':        {'N': (20, 60),  'P': (55, 80),  'K': (75, 85),  'temp': (17, 25), 'humidity': (14, 30), 'ph': (6.0, 8.5), 'rainfall': (65, 95),   'base_yield': 12, 'cost': 14000, 'price_q': 5440},
            'kidneybeans':     {'N': (15, 40),  'P': (55, 80),  'K': (15, 25),  'temp': (15, 24), 'humidity': (18, 35), 'ph': (5.5, 6.5), 'rainfall': (60, 150),  'base_yield': 10, 'cost': 15000, 'price_q': 7200},
            'pigeonpeas':      {'N': (15, 40),  'P': (55, 80),  'K': (15, 25),  'temp': (24, 35), 'humidity': (45, 70), 'ph': (5.5, 7.5), 'rainfall': (90, 180),  'base_yield': 10, 'cost': 12000, 'price_q': 6000},
            'mothbeans':       {'N': (10, 30),  'P': (35, 60),  'K': (15, 25),  'temp': (24, 35), 'humidity': (40, 65), 'ph': (5.5, 8.5), 'rainfall': (30, 75),   'base_yield': 7,  'cost': 9000,  'price_q': 5500},
            'mungbean':        {'N': (15, 35),  'P': (35, 60),  'K': (15, 25),  'temp': (25, 35), 'humidity': (75, 90), 'ph': (6.2, 7.5), 'rainfall': (35, 65),   'base_yield': 8,  'cost': 11000, 'price_q': 8558},
            'blackgram':       {'N': (40, 60),  'P': (55, 80),  'K': (15, 25),  'temp': (25, 35), 'humidity': (60, 75), 'ph': (6.5, 7.8), 'rainfall': (60, 85),   'base_yield': 8,  'cost': 10000, 'price_q': 6500},
            'lentil':          {'N': (15, 35),  'P': (55, 80),  'K': (15, 25),  'temp': (15, 25), 'humidity': (55, 70), 'ph': (5.9, 7.8), 'rainfall': (35, 65),   'base_yield': 9,  'cost': 11000, 'price_q': 5800},
            'cowpea':          {'N': (15, 35),  'P': (35, 60),  'K': (15, 30),  'temp': (22, 35), 'humidity': (50, 75), 'ph': (5.5, 7.5), 'rainfall': (50, 100),  'base_yield': 8,  'cost': 11000, 'price_q': 5000},
            'fieldpea':        {'N': (15, 35),  'P': (40, 65),  'K': (20, 35),  'temp': (12, 22), 'humidity': (55, 75), 'ph': (6.0, 7.5), 'rainfall': (40, 75),   'base_yield': 10, 'cost': 12000, 'price_q': 4500},
            'horsegram':       {'N': (10, 30),  'P': (25, 50),  'K': (15, 25),  'temp': (22, 34), 'humidity': (40, 65), 'ph': (5.0, 7.5), 'rainfall': (35, 70),   'base_yield': 6,  'cost': 8000,  'price_q': 4200},
            'soybean':         {'N': (20, 45),  'P': (50, 75),  'K': (30, 50),  'temp': (20, 32), 'humidity': (60, 80), 'ph': (6.0, 7.0), 'rainfall': (70, 130),  'base_yield': 12, 'cost': 14000, 'price_q': 4600},
            'greenpea':        {'N': (15, 35),  'P': (45, 70),  'K': (20, 40),  'temp': (10, 20), 'humidity': (60, 80), 'ph': (6.0, 7.5), 'rainfall': (45, 80),   'base_yield': 25, 'cost': 20000, 'price_q': 3000},

            # ─── OILSEEDS ───
            'groundnut':       {'N': (20, 45),  'P': (35, 60),  'K': (20, 35),  'temp': (22, 32), 'humidity': (55, 75), 'ph': (6.0, 7.5), 'rainfall': (50, 100),  'base_yield': 14, 'cost': 18000, 'price_q': 6377},
            'mustard':         {'N': (50, 90),  'P': (30, 55),  'K': (20, 40),  'temp': (12, 25), 'humidity': (50, 70), 'ph': (6.0, 7.8), 'rainfall': (40, 80),   'base_yield': 10, 'cost': 12000, 'price_q': 5650},
            'sunflower':       {'N': (40, 80),  'P': (35, 60),  'K': (30, 50),  'temp': (20, 32), 'humidity': (50, 70), 'ph': (6.0, 7.5), 'rainfall': (50, 95),   'base_yield': 10, 'cost': 15000, 'price_q': 6760},
            'sesame':          {'N': (25, 50),  'P': (20, 40),  'K': (20, 35),  'temp': (25, 35), 'humidity': (45, 65), 'ph': (5.5, 7.8), 'rainfall': (40, 75),   'base_yield': 5,  'cost': 10000, 'price_q': 8635},
            'safflower':       {'N': (30, 60),  'P': (20, 40),  'K': (20, 35),  'temp': (16, 28), 'humidity': (40, 60), 'ph': (6.0, 8.0), 'rainfall': (35, 70),   'base_yield': 8,  'cost': 12000, 'price_q': 5800},
            'castor':          {'N': (30, 60),  'P': (20, 40),  'K': (20, 35),  'temp': (22, 35), 'humidity': (45, 70), 'ph': (5.5, 8.0), 'rainfall': (45, 90),   'base_yield': 10, 'cost': 14000, 'price_q': 6000},
            'nigerseed':       {'N': (20, 40),  'P': (15, 30),  'K': (15, 30),  'temp': (18, 30), 'humidity': (50, 75), 'ph': (5.5, 7.2), 'rainfall': (60, 110),  'base_yield': 4,  'cost': 8000,  'price_q': 7734},
            'linseed':         {'N': (30, 60),  'P': (20, 40),  'K': (20, 35),  'temp': (12, 24), 'humidity': (50, 70), 'ph': (6.0, 7.5), 'rainfall': (40, 75),   'base_yield': 6,  'cost': 10000, 'price_q': 5500},
            'canola':          {'N': (50, 90),  'P': (30, 55),  'K': (25, 45),  'temp': (10, 22), 'humidity': (50, 70), 'ph': (6.0, 7.5), 'rainfall': (45, 85),   'base_yield': 12, 'cost': 14000, 'price_q': 5800},
            'palmoil':         {'N': (80, 140), 'P': (40, 75),  'K': (60, 100), 'temp': (24, 33), 'humidity': (75, 95), 'ph': (5.0, 6.5), 'rainfall': (180, 320), 'base_yield': 80, 'cost': 50000, 'price_q': 1200},

            # ─── COMMERCIAL & CASH CROPS ───
            'sugarcane':       {'N': (100, 160),'P': (50, 90),  'K': (50, 90),  'temp': (24, 38), 'humidity': (65, 85), 'ph': (6.0, 7.5), 'rainfall': (120, 220), 'base_yield': 350,'cost': 55000, 'price_q': 315},
            'cotton':          {'N': (90, 130), 'P': (35, 60),  'K': (15, 25),  'temp': (22, 34), 'humidity': (70, 85), 'ph': (6.0, 8.0), 'rainfall': (60, 100),  'base_yield': 12, 'cost': 28000, 'price_q': 7020},
            'jute':            {'N': (60, 100), 'P': (35, 60),  'K': (35, 45),  'temp': (23, 33), 'humidity': (70, 90), 'ph': (6.0, 7.5), 'rainfall': (150, 250), 'base_yield': 25, 'cost': 18000, 'price_q': 3500},
            'tobacco':         {'N': (40, 80),  'P': (30, 60),  'K': (50, 90),  'temp': (20, 32), 'humidity': (60, 80), 'ph': (5.5, 7.0), 'rainfall': (50, 100),  'base_yield': 15, 'cost': 25000, 'price_q': 4500},
            'tea':             {'N': (80, 140), 'P': (30, 60),  'K': (40, 70),  'temp': (18, 30), 'humidity': (75, 95), 'ph': (4.5, 5.8), 'rainfall': (150, 300), 'base_yield': 18, 'cost': 60000, 'price_q': 12000},
            'coffee':          {'N': (70, 120), 'P': (15, 40),  'K': (25, 45),  'temp': (18, 28), 'humidity': (60, 85), 'ph': (5.5, 6.8), 'rainfall': (130, 220), 'base_yield': 5,  'cost': 70000, 'price_q': 15000},
            'rubber':          {'N': (60, 110), 'P': (30, 60),  'K': (40, 80),  'temp': (22, 34), 'humidity': (75, 95), 'ph': (4.5, 6.0), 'rainfall': (180, 300), 'base_yield': 15, 'cost': 50000, 'price_q': 16000},
            'arecanut':        {'N': (60, 110), 'P': (30, 60),  'K': (60, 110), 'temp': (18, 35), 'humidity': (70, 90), 'ph': (5.5, 7.5), 'rainfall': (150, 300), 'base_yield': 12, 'cost': 45000, 'price_q': 40000},
            'betelvine':       {'N': (50, 90),  'P': (30, 60),  'K': (40, 75),  'temp': (20, 32), 'humidity': (75, 95), 'ph': (6.0, 7.5), 'rainfall': (100, 200), 'base_yield': 40, 'cost': 40000, 'price_q': 3000},
            'mulberry':        {'N': (60, 110), 'P': (30, 60),  'K': (30, 60),  'temp': (20, 32), 'humidity': (65, 85), 'ph': (6.2, 7.5), 'rainfall': (60, 120),  'base_yield': 100,'cost': 35000, 'price_q': 800},

            # ─── SPICES & CONDIMENTS ───
            'turmeric':        {'N': (60, 110), 'P': (30, 60),  'K': (60, 100), 'temp': (20, 34), 'humidity': (70, 90), 'ph': (5.5, 7.5), 'rainfall': (120, 220), 'base_yield': 22, 'cost': 35000, 'price_q': 7500},
            'ginger':          {'N': (60, 110), 'P': (30, 60),  'K': (60, 100), 'temp': (20, 32), 'humidity': (70, 90), 'ph': (5.5, 6.8), 'rainfall': (130, 240), 'base_yield': 80, 'cost': 45000, 'price_q': 4000},
            'garlic':          {'N': (40, 80),  'P': (30, 60),  'K': (30, 60),  'temp': (12, 25), 'humidity': (50, 70), 'ph': (6.0, 7.5), 'rainfall': (40, 80),   'base_yield': 35, 'cost': 30000, 'price_q': 5000},
            'redchili':        {'N': (50, 100), 'P': (30, 60),  'K': (30, 60),  'temp': (20, 35), 'humidity': (55, 80), 'ph': (6.0, 7.5), 'rainfall': (60, 110),  'base_yield': 15, 'cost': 30000, 'price_q': 12000},
            'blackpepper':     {'N': (50, 90),  'P': (25, 50),  'K': (50, 90),  'temp': (20, 34), 'humidity': (75, 95), 'ph': (5.5, 6.5), 'rainfall': (160, 300), 'base_yield': 6,  'cost': 40000, 'price_q': 50000},
            'cardamom':        {'N': (40, 80),  'P': (25, 50),  'K': (50, 90),  'temp': (15, 28), 'humidity': (75, 95), 'ph': (5.5, 6.5), 'rainfall': (150, 300), 'base_yield': 2,  'cost': 50000, 'price_q': 150000},
            'cumin':           {'N': (25, 50),  'P': (15, 35),  'K': (15, 30),  'temp': (15, 28), 'humidity': (35, 60), 'ph': (6.5, 8.2), 'rainfall': (25, 55),   'base_yield': 5,  'cost': 15000, 'price_q': 22000},
            'coriander':       {'N': (30, 60),  'P': (20, 40),  'K': (20, 40),  'temp': (15, 28), 'humidity': (45, 70), 'ph': (6.0, 7.8), 'rainfall': (35, 75),   'base_yield': 6,  'cost': 12000, 'price_q': 7500},
            'fennel':          {'N': (30, 60),  'P': (20, 40),  'K': (20, 40),  'temp': (15, 28), 'humidity': (40, 65), 'ph': (6.5, 8.0), 'rainfall': (35, 70),   'base_yield': 7,  'cost': 14000, 'price_q': 8500},
            'fenugreek':       {'N': (20, 45),  'P': (20, 40),  'K': (20, 35),  'temp': (12, 25), 'humidity': (45, 65), 'ph': (6.0, 7.5), 'rainfall': (35, 65),   'base_yield': 6,  'cost': 10000, 'price_q': 6000},
            'clove':           {'N': (40, 80),  'P': (20, 40),  'K': (40, 80),  'temp': (20, 34), 'humidity': (75, 95), 'ph': (5.5, 6.8), 'rainfall': (150, 280), 'base_yield': 3,  'cost': 35000, 'price_q': 70000},
            'cinnamon':        {'N': (40, 80),  'P': (20, 40),  'K': (30, 60),  'temp': (20, 32), 'humidity': (75, 95), 'ph': (5.5, 6.8), 'rainfall': (150, 280), 'base_yield': 4,  'cost': 30000, 'price_q': 45000},
            'nutmeg':          {'N': (40, 80),  'P': (20, 40),  'K': (40, 80),  'temp': (22, 34), 'humidity': (75, 95), 'ph': (5.5, 6.8), 'rainfall': (160, 300), 'base_yield': 4,  'cost': 35000, 'price_q': 50000},
            'saffron':         {'N': (20, 40),  'P': (20, 40),  'K': (20, 40),  'temp': (5, 20),  'humidity': (40, 65), 'ph': (6.0, 7.8), 'rainfall': (30, 70),   'base_yield': 0.1,'cost': 60000, 'price_q': 2500000},
            'vanilla':         {'N': (40, 80),  'P': (20, 40),  'K': (30, 60),  'temp': (20, 32), 'humidity': (75, 95), 'ph': (5.5, 6.5), 'rainfall': (150, 260), 'base_yield': 1.5,'cost': 50000, 'price_q': 200000},

            # ─── VEGETABLES & TUBERS ───
            'potato':          {'N': (60, 110), 'P': (40, 75),  'K': (60, 110), 'temp': (14, 24), 'humidity': (60, 80), 'ph': (5.2, 6.5), 'rainfall': (50, 100),  'base_yield': 120,'cost': 35000, 'price_q': 1200},
            'tomato':          {'N': (50, 100), 'P': (35, 70),  'K': (40, 80),  'temp': (18, 30), 'humidity': (60, 80), 'ph': (6.0, 7.2), 'rainfall': (50, 100),  'base_yield': 150,'cost': 40000, 'price_q': 1500},
            'onion':           {'N': (40, 80),  'P': (30, 60),  'K': (40, 75),  'temp': (14, 28), 'humidity': (50, 75), 'ph': (6.0, 7.5), 'rainfall': (40, 85),   'base_yield': 100,'cost': 30000, 'price_q': 1800},
            'brinjal':         {'N': (50, 90),  'P': (30, 60),  'K': (30, 60),  'temp': (20, 33), 'humidity': (60, 80), 'ph': (5.5, 7.0), 'rainfall': (50, 110),  'base_yield': 120,'cost': 30000, 'price_q': 1200},
            'okra':            {'N': (40, 80),  'P': (30, 60),  'K': (30, 60),  'temp': (22, 35), 'humidity': (65, 85), 'ph': (6.0, 7.5), 'rainfall': (50, 110),  'base_yield': 60, 'cost': 22000, 'price_q': 2000},
            'cabbage':         {'N': (60, 110), 'P': (35, 65),  'K': (40, 75),  'temp': (12, 22), 'humidity': (65, 85), 'ph': (6.0, 7.2), 'rainfall': (50, 90),   'base_yield': 140,'cost': 25000, 'price_q': 1000},
            'cauliflower':     {'N': (60, 110), 'P': (35, 65),  'K': (40, 75),  'temp': (12, 22), 'humidity': (65, 85), 'ph': (6.0, 7.2), 'rainfall': (50, 90),   'base_yield': 110,'cost': 28000, 'price_q': 1400},
            'carrot':          {'N': (35, 70),  'P': (30, 60),  'K': (40, 80),  'temp': (12, 24), 'humidity': (60, 80), 'ph': (6.0, 7.0), 'rainfall': (45, 85),   'base_yield': 90, 'cost': 22000, 'price_q': 1500},
            'radish':          {'N': (30, 60),  'P': (20, 45),  'K': (30, 60),  'temp': (12, 25), 'humidity': (55, 80), 'ph': (6.0, 7.5), 'rainfall': (40, 80),   'base_yield': 80, 'cost': 16000, 'price_q': 800},
            'beetroot':        {'N': (35, 70),  'P': (30, 60),  'K': (40, 80),  'temp': (14, 25), 'humidity': (60, 80), 'ph': (6.0, 7.5), 'rainfall': (45, 85),   'base_yield': 85, 'cost': 20000, 'price_q': 1300},
            'spinach':         {'N': (40, 80),  'P': (25, 50),  'K': (30, 60),  'temp': (12, 24), 'humidity': (60, 80), 'ph': (6.2, 7.5), 'rainfall': (40, 80),   'base_yield': 45, 'cost': 15000, 'price_q': 1500},
            'cucumber':        {'N': (40, 80),  'P': (30, 60),  'K': (30, 60),  'temp': (20, 32), 'humidity': (65, 85), 'ph': (6.0, 7.2), 'rainfall': (45, 90),   'base_yield': 100,'cost': 20000, 'price_q': 1200},
            'bottlegourd':     {'N': (40, 80),  'P': (30, 60),  'K': (30, 60),  'temp': (22, 34), 'humidity': (60, 80), 'ph': (6.0, 7.2), 'rainfall': (45, 90),   'base_yield': 120,'cost': 20000, 'price_q': 1000},
            'bittergourd':     {'N': (40, 80),  'P': (30, 60),  'K': (30, 60),  'temp': (22, 35), 'humidity': (60, 80), 'ph': (6.0, 7.2), 'rainfall': (45, 90),   'base_yield': 65, 'cost': 22000, 'price_q': 2200},
            'ridgegourd':      {'N': (40, 80),  'P': (30, 60),  'K': (30, 60),  'temp': (22, 34), 'humidity': (60, 80), 'ph': (6.0, 7.2), 'rainfall': (45, 90),   'base_yield': 60, 'cost': 20000, 'price_q': 1800},
            'pumpkin':         {'N': (40, 80),  'P': (30, 60),  'K': (30, 60),  'temp': (20, 32), 'humidity': (60, 80), 'ph': (6.0, 7.5), 'rainfall': (45, 90),   'base_yield': 130,'cost': 18000, 'price_q': 800},
            'capsicum':        {'N': (50, 95),  'P': (35, 70),  'K': (40, 80),  'temp': (16, 28), 'humidity': (60, 80), 'ph': (6.0, 7.0), 'rainfall': (50, 100),  'base_yield': 80, 'cost': 35000, 'price_q': 2500},
            'greenchili':      {'N': (50, 95),  'P': (30, 60),  'K': (30, 60),  'temp': (20, 33), 'humidity': (60, 80), 'ph': (6.0, 7.5), 'rainfall': (50, 100),  'base_yield': 50, 'cost': 25000, 'price_q': 3000},
            'sweetpotato':     {'N': (30, 60),  'P': (30, 60),  'K': (50, 95),  'temp': (20, 32), 'humidity': (65, 85), 'ph': (5.5, 6.8), 'rainfall': (60, 120),  'base_yield': 90, 'cost': 20000, 'price_q': 1500},
            'cassava':         {'N': (40, 80),  'P': (30, 60),  'K': (60, 110), 'temp': (22, 35), 'humidity': (65, 85), 'ph': (5.5, 7.0), 'rainfall': (80, 160),  'base_yield': 140,'cost': 25000, 'price_q': 1000},
            'yam':             {'N': (40, 80),  'P': (30, 60),  'K': (50, 95),  'temp': (22, 34), 'humidity': (65, 85), 'ph': (5.5, 6.8), 'rainfall': (80, 160),  'base_yield': 110,'cost': 25000, 'price_q': 1400},
            'elephantfootyam': {'N': (40, 80),  'P': (30, 60),  'K': (60, 110), 'temp': (22, 34), 'humidity': (65, 85), 'ph': (5.5, 7.0), 'rainfall': (80, 160),  'base_yield': 150,'cost': 35000, 'price_q': 1800},
            'moringa':         {'N': (30, 60),  'P': (20, 45),  'K': (20, 45),  'temp': (22, 38), 'humidity': (45, 70), 'ph': (6.0, 7.8), 'rainfall': (35, 85),   'base_yield': 100,'cost': 25000, 'price_q': 2000},
            'clusterbeans':    {'N': (20, 40),  'P': (25, 50),  'K': (15, 30),  'temp': (25, 38), 'humidity': (40, 65), 'ph': (6.5, 8.2), 'rainfall': (30, 65),   'base_yield': 25, 'cost': 12000, 'price_q': 4000},
            'lettuce':         {'N': (35, 70),  'P': (25, 50),  'K': (30, 60),  'temp': (12, 22), 'humidity': (65, 85), 'ph': (6.0, 7.0), 'rainfall': (40, 80),   'base_yield': 50, 'cost': 20000, 'price_q': 2500},

            # ─── FRUITS & HORTICULTURE ───
            'mango':           {'N': (30, 60),  'P': (15, 40),  'K': (25, 45),  'temp': (24, 38), 'humidity': (45, 65), 'ph': (5.5, 7.5), 'rainfall': (85, 150),  'base_yield': 150,'cost': 40000, 'price_q': 3000},
            'banana':          {'N': (80, 130), 'P': (70, 95),  'K': (45, 75),  'temp': (20, 33), 'humidity': (75, 88), 'ph': (5.5, 6.8), 'rainfall': (90, 160),  'base_yield': 300,'cost': 50000, 'price_q': 1500},
            'apple':           {'N': (20, 50),  'P': (100, 140),'K': (150, 200),'temp': (6, 22),  'humidity': (70, 90), 'ph': (5.5, 6.5), 'rainfall': (100, 140), 'base_yield': 120,'cost': 60000, 'price_q': 8000},
            'guava':           {'N': (30, 60),  'P': (20, 45),  'K': (25, 50),  'temp': (18, 33), 'humidity': (50, 75), 'ph': (5.5, 7.5), 'rainfall': (60, 120),  'base_yield': 100,'cost': 25000, 'price_q': 2000},
            'papaya':          {'N': (35, 70),  'P': (45, 70),  'K': (45, 65),  'temp': (22, 38), 'humidity': (70, 90), 'ph': (6.5, 7.2), 'rainfall': (40, 200),  'base_yield': 250,'cost': 35000, 'price_q': 1800},
            'orange':          {'N': (25, 50),  'P': (15, 35),  'K': (15, 35),  'temp': (12, 32), 'humidity': (60, 85), 'ph': (6.0, 7.8), 'rainfall': (90, 140),  'base_yield': 100,'cost': 45000, 'price_q': 4000},
            'lemon':           {'N': (25, 50),  'P': (15, 35),  'K': (15, 35),  'temp': (14, 34), 'humidity': (55, 80), 'ph': (6.0, 7.8), 'rainfall': (70, 130),  'base_yield': 90, 'cost': 35000, 'price_q': 3500},
            'pineapple':       {'N': (40, 80),  'P': (20, 45),  'K': (50, 90),  'temp': (20, 32), 'humidity': (70, 90), 'ph': (4.5, 5.8), 'rainfall': (100, 200), 'base_yield': 200,'cost': 45000, 'price_q': 2000},
            'pomegranate':     {'N': (20, 45),  'P': (10, 30),  'K': (35, 50),  'temp': (18, 35), 'humidity': (40, 65), 'ph': (5.5, 7.8), 'rainfall': (50, 100),  'base_yield': 120,'cost': 60000, 'price_q': 8000},
            'grapes':          {'N': (20, 45),  'P': (100, 140),'K': (150, 200),'temp': (14, 32), 'humidity': (50, 75), 'ph': (5.5, 7.0), 'rainfall': (50, 90),   'base_yield': 150,'cost': 80000, 'price_q': 6000},
            'watermelon':      {'N': (80, 120), 'P': (15, 35),  'K': (45, 65),  'temp': (22, 35), 'humidity': (60, 85), 'ph': (6.0, 7.2), 'rainfall': (40, 70),   'base_yield': 180,'cost': 20000, 'price_q': 1000},
            'muskmelon':       {'N': (80, 120), 'P': (15, 35),  'K': (45, 65),  'temp': (24, 36), 'humidity': (60, 85), 'ph': (6.0, 7.2), 'rainfall': (30, 60),   'base_yield': 120,'cost': 18000, 'price_q': 1200},
            'coconut':         {'N': (20, 50),  'P': (15, 35),  'K': (35, 60),  'temp': (22, 32), 'humidity': (75, 95), 'ph': (5.5, 7.2), 'rainfall': (130, 250), 'base_yield': 14, 'cost': 35000, 'price_q': 9500},
            'cashew':          {'N': (20, 45),  'P': (15, 35),  'K': (20, 45),  'temp': (22, 35), 'humidity': (60, 85), 'ph': (5.0, 6.8), 'rainfall': (80, 180),  'base_yield': 10, 'cost': 25000, 'price_q': 12000},
            'dragonfruit':     {'N': (30, 60),  'P': (20, 45),  'K': (30, 60),  'temp': (20, 35), 'humidity': (50, 75), 'ph': (5.5, 7.0), 'rainfall': (50, 120),  'base_yield': 80, 'cost': 60000, 'price_q': 10000},
            'custardapple':    {'N': (20, 45),  'P': (15, 35),  'K': (20, 45),  'temp': (18, 35), 'humidity': (45, 70), 'ph': (5.5, 7.5), 'rainfall': (50, 100),  'base_yield': 60, 'cost': 22000, 'price_q': 4500},
            'fig':             {'N': (20, 45),  'P': (15, 35),  'K': (30, 55),  'temp': (16, 32), 'humidity': (45, 70), 'ph': (6.0, 7.8), 'rainfall': (40, 85),   'base_yield': 50, 'cost': 30000, 'price_q': 8000},
            'sapota':          {'N': (25, 50),  'P': (15, 35),  'K': (25, 50),  'temp': (18, 34), 'humidity': (60, 85), 'ph': (6.0, 7.8), 'rainfall': (80, 150),  'base_yield': 90, 'cost': 30000, 'price_q': 2500},
            'strawberry':      {'N': (30, 60),  'P': (30, 60),  'K': (40, 75),  'temp': (10, 22), 'humidity': (60, 80), 'ph': (5.5, 6.5), 'rainfall': (60, 110),  'base_yield': 60, 'cost': 80000, 'price_q': 15000},
            'kiwi':            {'N': (30, 60),  'P': (30, 60),  'K': (40, 75),  'temp': (8, 22),  'humidity': (65, 85), 'ph': (5.5, 6.5), 'rainfall': (90, 150),  'base_yield': 70, 'cost': 75000, 'price_q': 14000},
            'lychee':          {'N': (30, 60),  'P': (20, 45),  'K': (30, 60),  'temp': (18, 32), 'humidity': (65, 88), 'ph': (5.5, 6.8), 'rainfall': (100, 180), 'base_yield': 70, 'cost': 35000, 'price_q': 5000},
            'jackfruit':       {'N': (30, 60),  'P': (20, 45),  'K': (30, 60),  'temp': (20, 35), 'humidity': (65, 88), 'ph': (5.5, 7.2), 'rainfall': (110, 220), 'base_yield': 150,'cost': 30000, 'price_q': 1500},

            # ─── FLOWERS & MEDICINAL / AROMATIC ───
            'marigold':        {'N': (30, 60),  'P': (25, 50),  'K': (25, 50),  'temp': (15, 30), 'humidity': (50, 75), 'ph': (6.0, 7.5), 'rainfall': (40, 90),   'base_yield': 70, 'cost': 25000, 'price_q': 3000},
            'rose':            {'N': (40, 80),  'P': (30, 60),  'K': (40, 75),  'temp': (14, 28), 'humidity': (55, 80), 'ph': (6.0, 7.0), 'rainfall': (50, 100),  'base_yield': 40, 'cost': 60000, 'price_q': 10000},
            'jasmine':         {'N': (30, 60),  'P': (25, 50),  'K': (30, 60),  'temp': (18, 32), 'humidity': (60, 85), 'ph': (6.0, 7.5), 'rainfall': (60, 120),  'base_yield': 30, 'cost': 45000, 'price_q': 12000},
            'ashwagandha':     {'N': (15, 35),  'P': (15, 35),  'K': (15, 35),  'temp': (20, 35), 'humidity': (40, 65), 'ph': (6.5, 8.2), 'rainfall': (30, 65),   'base_yield': 5,  'cost': 18000, 'price_q': 25000},
            'aloevera':        {'N': (10, 30),  'P': (10, 30),  'K': (15, 35),  'temp': (20, 38), 'humidity': (30, 60), 'ph': (6.0, 8.2), 'rainfall': (20, 50),   'base_yield': 150,'cost': 20000, 'price_q': 500},
            'lemongrass':      {'N': (30, 60),  'P': (20, 40),  'K': (30, 60),  'temp': (20, 35), 'humidity': (55, 85), 'ph': (5.5, 7.5), 'rainfall': (70, 150),   'base_yield': 100,'cost': 20000, 'price_q': 1500},
            'mint':            {'N': (40, 80),  'P': (25, 50),  'K': (30, 60),  'temp': (15, 30), 'humidity': (60, 85), 'ph': (6.0, 7.5), 'rainfall': (60, 120),  'base_yield': 80, 'cost': 22000, 'price_q': 2000},
            'tulsi':           {'N': (20, 45),  'P': (20, 40),  'K': (20, 40),  'temp': (18, 35), 'humidity': (50, 80), 'ph': (6.0, 7.8), 'rainfall': (40, 90),   'base_yield': 40, 'cost': 15000, 'price_q': 4000},
        }

        def compute_suitability(prof, N, P, K, temp, humidity, ph, rainfall):
            def get_factor(val, range_tuple):
                mid = (range_tuple[0] + range_tuple[1]) / 2.0
                half_w = max(1e-5, (range_tuple[1] - range_tuple[0]) / 2.0)
                dev = abs(val - mid) / half_w
                return max(0.5, 1.15 - (dev * 0.15))

            f_N = get_factor(N, prof['N'])
            f_P = get_factor(P, prof['P'])
            f_K = get_factor(K, prof['K'])
            f_temp = get_factor(temp, prof['temp'])
            f_hum = get_factor(humidity, prof['humidity'])
            f_ph = get_factor(ph, prof['ph'])
            f_rain = get_factor(rainfall, prof['rainfall'])

            return (f_N * 0.15 + f_P * 0.15 + f_K * 0.15 + f_temp * 0.2 + f_hum * 0.1 + f_ph * 0.1 + f_rain * 0.15)

        samples = []
        for crop, prof in crop_profiles.items():
            n_samples = 400 if crop in CEREAL_CROPS else 100
            for _ in range(n_samples):
                N = np.clip(np.random.normal(np.mean(prof['N']), (prof['N'][1] - prof['N'][0])/6), 0, 160)
                P = np.clip(np.random.normal(np.mean(prof['P']), (prof['P'][1] - prof['P'][0])/6), 5, 150)
                K = np.clip(np.random.normal(np.mean(prof['K']), (prof['K'][1] - prof['K'][0])/6), 5, 210)
                temp = np.clip(np.random.normal(np.mean(prof['temp']), (prof['temp'][1] - prof['temp'][0])/6), 5, 45)
                humidity = np.clip(np.random.normal(np.mean(prof['humidity']), (prof['humidity'][1] - prof['humidity'][0])/6), 14, 99)
                ph = np.clip(np.random.normal(np.mean(prof['ph']), (prof['ph'][1] - prof['ph'][0])/6), 3.5, 9.5)
                rainfall = np.clip(np.random.normal(np.mean(prof['rainfall']), (prof['rainfall'][1] - prof['rainfall'][0])/6), 20, 350)

                base_y = prof.get('base_yield', 15)
                suitability = compute_suitability(prof, N, P, K, temp, humidity, ph, rainfall)
                yield_q = round(base_y * suitability, 2)
                gross_rev = round(yield_q * prof['price_q'], 2)
                net_prof = round(gross_rev - prof['cost'], 2)

                samples.append({
                    'N': round(N, 2),
                    'P': round(P, 2),
                    'K': round(K, 2),
                    'temperature': round(temp, 2),
                    'humidity': round(humidity, 2),
                    'ph': round(ph, 2),
                    'rainfall': round(rainfall, 2),
                    'label': crop,
                    'yield_q': yield_q,
                    'cost_per_acre': prof['cost'],
                    'price_per_q': prof['price_q'],
                    'gross_revenue': gross_rev,
                    'net_profit': net_prof,
                })

        df = pd.DataFrame(samples)
        df = extract_engineered_features(df)
        df.to_csv(filepath, index=False)
        print(f"[+] Dataset created with {len(df)} samples ({len(df[df['label'].isin(CEREAL_CROPS)])} Cereal samples) across {df['label'].nunique()} crop classes.")

    return df

# -----------------------------------------------------------------------------
# 2. Main Training Pipeline (High-Accuracy Classifier + Yield Regressor)
# -----------------------------------------------------------------------------
def run_pipeline():
    print("==================================================================")
    print("   HIGH-ACCURACY AGRITECH ML ENGINE: CLASSIFIER & REGRESSOR")
    print("==================================================================")

    models_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(models_dir, exist_ok=True)

    df = load_or_generate_dataset(force_regenerate=True)

    X = df[FEATURE_COLS]
    y_crop = df['label']
    y_yield = df['yield_q']

    label_encoder = LabelEncoder()
    y_crop_encoded = label_encoder.fit_transform(y_crop)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # 1. Train Crop Classifier Model
    X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(
        X_scaled, y_crop_encoded, test_size=0.2, random_state=42, stratify=y_crop_encoded
    )

    clf = RandomForestClassifier(n_estimators=250, max_depth=25, class_weight='balanced', random_state=42)
    clf.fit(X_train_c, y_train_c)
    acc = accuracy_score(y_test_c, clf.predict(X_test_c))

    cereal_indices = [i for i, c in enumerate(label_encoder.classes_) if c in CEREAL_CROPS]
    test_cereal_mask = np.isin(y_test_c, cereal_indices)
    cereal_acc = accuracy_score(y_test_c[test_cereal_mask], clf.predict(X_test_c[test_cereal_mask]))
    print(f"[+] High-Accuracy Crop Classifier Trained! Overall Accuracy: {acc * 100:.2f}% | Cereal Crop Accuracy: {cereal_acc * 100:.2f}%")

    # 2. Train Yield Regressor Model
    X_reg = np.column_stack((X_scaled, y_crop_encoded))
    X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(
        X_reg, y_yield, test_size=0.2, random_state=42
    )

    reg = RandomForestRegressor(n_estimators=200, random_state=42)
    reg.fit(X_train_r, y_train_r)
    r2 = r2_score(y_test_r, reg.predict(X_test_r))
    mae = mean_absolute_error(y_test_r, reg.predict(X_test_r))
    print(f"[+] Yield Regressor Trained! R2 Score: {r2:.4f}, MAE: {mae:.2f} Quintals/Acre")

    # Save artifacts
    model_path = os.path.join(models_dir, "crop_recommendation_model.pkl")
    reg_path = os.path.join(models_dir, "yield_regression_model.pkl")
    scaler_path = os.path.join(models_dir, "scaler.pkl")
    encoder_path = os.path.join(models_dir, "label_encoder.pkl")

    joblib.dump(clf, model_path, compress=3)
    joblib.dump(reg, reg_path, compress=3)
    joblib.dump(scaler, scaler_path, compress=3)
    joblib.dump(label_encoder, encoder_path, compress=3)

    print(f"[+] Saved Crop Classifier Model: {model_path}")
    print(f"[+] Saved Yield Regressor Model: {reg_path}")
    print(f"[+] Saved Scaler: {scaler_path}")
    print(f"[+] Saved Label Encoder: {encoder_path}")
    print("==================================================================")

if __name__ == "__main__":
    run_pipeline()
