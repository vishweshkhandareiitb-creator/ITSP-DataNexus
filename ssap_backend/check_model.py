import joblib

file_path = '../models/final_random_forest.pkl'

print("Attempting to load with joblib...")
try:
    model = joblib.load(file_path)
    
    print("\n=== EXPECTED CLASSES (Probabilities Order) ===")
    print(model.classes_)

    print("\n=== EXPECTED FEATURES (In exact order) ===")
    try:
        print(list(model.feature_names_in_))
    except AttributeError:
        print("Feature names not stored natively in this scikit-learn version.")
        
except Exception as e:
    print(f"Joblib load failed: {e}")