import zipfile
import xml.etree.ElementTree as ET
import os

dir_path = "/Users/swaraj/Documents/z-b2b/dummtdatasets/cibil_ind"
files = ["External_Cibil_Dataset.xlsx", "Internal_Bank_Dataset.xlsx", "Unseen_Dataset.xlsx"]

def get_xlsx_columns(filepath):
    try:
        with zipfile.ZipFile(filepath, 'r') as z:
            # Get shared strings
            shared_strings = []
            if 'xl/sharedStrings.xml' in z.namelist():
                ss_data = z.read('xl/sharedStrings.xml')
                root = ET.fromstring(ss_data)
                for si in root.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
                    t = si.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')
                    if t is not None:
                        shared_strings.append(t.text)
                    else:
                        shared_strings.append("")
                        
            # Get sheet1
            sheet_data = z.read('xl/worksheets/sheet1.xml')
            root = ET.fromstring(sheet_data)
            sheetData = root.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheetData')
            first_row = sheetData.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row')
            
            columns = []
            if first_row is not None:
                for c in first_row.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                    v = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                    if v is not None:
                        val = int(v.text)
                        if c.get('t') == 's':  # string
                            columns.append(shared_strings[val] if val < len(shared_strings) else str(val))
                        else:
                            columns.append(str(val))
            return columns
    except Exception as e:
        return [f"Error: {e}"]

for f in files:
    f_path = os.path.join(dir_path, f)
    print(f"=== Analyzing {f} ===")
    cols = get_xlsx_columns(f_path)
    print(f"Columns ({len(cols)}):")
    print(cols)
    print("\n")
