/**
 * Realistic Sample Datasets for 1-Click AI EDA Demonstration
 */

export const SAMPLE_DATASETS = [
  {
    id: 'education',
    name: 'Student Stress & Lifestyle',
    badge: 'Education',
    category: 'Academic & Lifestyle',
    icon: 'GraduationCap',
    color: 'blue',
    description: 'Study hours, sleep duration, screen time, GPA, attendance %, and stress score.',
    rows: 45,
    cols: 8,
    csv: `student_id,study_hours,sleep_hours,screen_time,gpa,attendance_pct,anxiety_level,stress_score
STU-001,6.5,7.5,3.2,3.82,94,2,38
STU-002,3.0,5.0,8.5,2.45,72,5,84
STU-003,5.2,6.8,4.5,3.40,88,3,52
STU-004,2.5,4.2,9.8,2.10,65,5,92
STU-005,7.0,8.0,2.5,3.95,98,1,28
STU-006,4.0,5.8,6.8,2.90,78,4,72
STU-007,5.8,7.0,4.0,3.55,90,2,45
STU-008,3.2,4.8,8.2,2.35,70,5,86
STU-009,6.0,7.2,3.8,3.68,92,2,42
STU-010,4.5,6.0,6.0,3.10,82,3,62
STU-011,7.5,8.2,2.0,3.98,99,1,24
STU-012,2.0,4.0,10.2,1.95,60,5,96
STU-013,5.5,6.9,4.2,3.48,89,2,48
STU-014,3.8,5.5,7.2,2.75,75,4,76
STU-015,6.8,7.8,2.8,3.88,96,1,32
STU-016,3.5,5.2,7.8,2.55,73,4,80
STU-017,5.0,6.5,5.0,3.25,85,3,58
STU-018,2.8,4.5,9.0,2.20,68,5,88
STU-019,6.2,7.4,3.5,3.72,93,2,40
STU-020,4.2,5.9,6.5,2.95,80,3,68
STU-021,7.2,8.0,2.2,3.92,97,1,26
STU-022,3.1,4.9,8.4,2.40,71,5,85
STU-023,5.6,7.1,3.9,3.52,91,2,46
STU-024,3.9,5.6,7.0,2.80,77,4,74
STU-025,6.6,7.6,3.0,3.85,95,1,35
STU-026,2.6,4.3,9.5,2.15,66,5,90
STU-027,5.3,6.8,4.4,3.42,88,2,50
STU-028,4.4,6.1,5.8,3.15,83,3,60
STU-029,7.4,8.1,2.1,3.96,98,1,25
STU-030,2.2,4.1,10.0,2.00,62,5,94`
  },
  {
    id: 'healthcare',
    name: 'Clinical Biomarkers & Vitals',
    badge: 'Healthcare',
    category: 'Cardiovascular Risk',
    icon: 'Activity',
    color: 'emerald',
    description: 'Systolic blood pressure, fasting glucose, BMI, cholesterol, and risk score.',
    rows: 45,
    cols: 8,
    csv: `patient_id,age,systolic_bp,glucose_mg_dl,bmi,cholesterol,heart_rate,clinical_risk
P-101,54,142,126,28.4,218,74,High
P-102,42,118,92,23.1,175,68,Low
P-103,61,158,164,31.2,245,82,Very High
P-104,38,112,88,21.8,160,62,Low
P-105,49,135,115,27.0,205,71,Moderate
P-106,58,148,142,29.8,230,78,High
P-107,33,115,95,22.4,168,66,Low
P-108,67,162,178,33.5,260,86,Very High
P-109,45,124,102,24.6,188,70,Low
P-110,52,138,118,26.9,210,75,Moderate
P-111,29,110,85,20.5,152,64,Low
P-112,63,155,158,32.0,250,80,Very High
P-113,48,130,110,25.8,198,72,Moderate
P-114,56,145,135,28.9,224,76,High
P-115,36,116,90,22.0,165,65,Low
P-116,70,168,185,34.2,275,88,Very High
P-117,44,122,98,24.0,182,69,Low
P-118,51,136,120,27.5,212,74,Moderate
P-119,60,150,148,30.5,238,81,High
P-120,39,119,94,22.8,172,67,Low
P-121,55,144,130,28.2,220,77,High
P-122,41,120,91,23.5,178,68,Low
P-123,65,160,172,32.8,255,84,Very High
P-124,47,128,108,25.4,195,71,Moderate
P-125,53,140,124,27.8,215,75,High
P-126,31,114,87,21.2,158,63,Low
P-127,62,156,162,31.8,248,82,Very High
P-128,46,126,105,24.8,190,70,Moderate
P-129,57,146,138,29.2,228,78,High
P-130,35,115,89,21.9,162,64,Low`
  },
  {
    id: 'finance',
    name: 'Credit Risk & Loan Portfolio',
    badge: 'Finance',
    category: 'Lending & Credit Risk',
    icon: 'DollarSign',
    color: 'amber',
    description: 'Credit scores, annual income, loan amount, debt-to-income %, and approval status.',
    rows: 45,
    cols: 8,
    csv: `account_id,annual_income,credit_score,loan_amount,debt_to_income,interest_rate,employment_years,default_status
ACC-801,68000,720,18000,18.5,5.8,6,Approved
ACC-802,42000,610,25000,38.2,12.4,2,Default
ACC-803,115000,795,45000,12.0,4.2,12,Approved
ACC-804,35000,580,15000,44.0,14.5,1,Default
ACC-805,82000,740,28000,22.4,6.2,8,Approved
ACC-806,54000,645,22000,32.0,9.8,4,Approved
ACC-807,96000,775,35000,15.8,4.9,9,Approved
ACC-808,38000,595,20000,41.5,13.8,2,Default
ACC-809,72000,715,24000,20.0,6.5,5,Approved
ACC-810,48000,630,19000,35.0,11.0,3,Default
ACC-811,130000,810,60000,10.5,3.8,15,Approved
ACC-812,31000,560,12000,48.0,16.2,1,Default
ACC-813,88000,755,30000,17.2,5.4,7,Approved
ACC-814,58000,660,21000,28.5,8.9,4,Approved
ACC-815,102000,785,40000,14.0,4.5,11,Approved
ACC-816,36000,585,16000,42.0,14.0,2,Default
ACC-817,76000,730,26000,19.2,6.0,6,Approved
ACC-818,46000,625,18000,36.5,11.5,3,Default
ACC-819,92000,765,32000,16.0,5.1,9,Approved
ACC-820,40000,605,21000,39.0,12.8,2,Default
ACC-821,84000,745,27000,18.0,5.8,7,Approved
ACC-822,50000,640,20000,31.5,9.5,4,Approved
ACC-823,120000,800,50000,11.2,4.0,14,Approved
ACC-824,33000,570,14000,46.0,15.5,1,Default
ACC-825,78000,735,25000,18.8,6.1,6,Approved
ACC-826,52000,650,22000,30.0,9.2,4,Approved
ACC-827,98000,780,38000,14.5,4.6,10,Approved
ACC-828,37000,590,17000,43.0,14.2,2,Default
ACC-829,74000,725,23000,19.8,6.4,5,Approved
ACC-830,45000,620,19000,37.0,11.8,3,Default`
  },
  {
    id: 'sales',
    name: 'E-Commerce Orders & Margin',
    badge: 'Sales',
    category: 'Retail & Orders',
    icon: 'ShoppingBag',
    color: 'purple',
    description: 'Order value, product category, discount %, shipping days, and rating.',
    rows: 45,
    cols: 8,
    csv: `order_id,customer_age,product_category,order_value,discount_pct,shipping_days,rating,customer_segment
ORD-201,34,Electronics,240.50,10,3,4.8,Premium
ORD-202,22,Apparel,48.00,20,5,3.9,Standard
ORD-203,45,Home & Kitchen,185.00,5,2,4.6,Premium
ORD-204,19,Footwear,75.20,15,4,4.2,Standard
ORD-205,52,Electronics,420.00,8,2,4.9,Enterprise
ORD-206,29,Beauty,36.50,25,6,3.7,Standard
ORD-207,41,Home & Kitchen,130.00,10,3,4.5,Standard
ORD-208,36,Electronics,310.00,12,3,4.7,Premium
ORD-209,24,Apparel,62.00,15,4,4.1,Standard
ORD-210,48,Footwear,110.00,5,2,4.6,Premium
ORD-211,60,Home & Kitchen,220.00,8,3,4.8,Enterprise
ORD-212,21,Beauty,29.90,30,7,3.5,Standard
ORD-213,38,Electronics,285.00,10,2,4.8,Premium
ORD-214,27,Apparel,54.00,18,5,4.0,Standard
ORD-215,50,Home & Kitchen,195.00,6,2,4.7,Premium
ORD-216,33,Footwear,88.00,10,4,4.3,Standard
ORD-217,55,Electronics,460.00,5,1,5.0,Enterprise
ORD-218,23,Beauty,42.00,20,5,3.8,Standard
ORD-219,43,Home & Kitchen,145.00,12,3,4.4,Standard
ORD-220,31,Electronics,260.00,15,3,4.6,Premium
ORD-221,26,Apparel,58.00,16,4,4.0,Standard
ORD-222,46,Footwear,105.00,8,3,4.5,Premium
ORD-223,58,Electronics,395.00,10,2,4.8,Enterprise
ORD-224,20,Beauty,32.00,25,6,3.6,Standard
ORD-225,37,Home & Kitchen,170.00,10,3,4.6,Standard
ORD-226,30,Electronics,275.00,10,3,4.7,Premium
ORD-227,25,Apparel,60.00,15,4,4.1,Standard
ORD-228,47,Footwear,115.00,5,2,4.7,Premium
ORD-229,59,Home & Kitchen,210.00,8,2,4.8,Enterprise
ORD-230,22,Beauty,35.00,22,5,3.7,Standard`
  }
]
