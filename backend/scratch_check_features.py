from catboost import CatBoostRegressor
m = CatBoostRegressor()
m.load_model("models/catboost/operating_inflow_h1.cbm")
print("Feature count:", len(m.feature_names_))
print("First 30 features:")
for f in m.feature_names_[:30]:
    print(" ", f)
print("\n...last 10:")
for f in m.feature_names_[-10:]:
    print(" ", f)
