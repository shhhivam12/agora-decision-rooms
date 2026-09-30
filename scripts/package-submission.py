"""Create a source archive without credentials, dependencies or build artifacts."""
from pathlib import Path
import hashlib
import json
import zipfile

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'artifacts'/'submission'
EXCLUDED_DIRS={'.git','node_modules','.venv','venv','__pycache__','.pytest_cache','.gradle','build','dist','dist-web','Pods','.idea','.tmp-cdp-check','artifacts'}
EXCLUDED_SUFFIX={'.apk','.aab','.jks','.keystore','.pem','.pyc','.pyo','.mp4','.webm'}
archive=OUT/'roundtable-ai-source.zip'
files=[]
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for root in ['.github','docs','mobile','server','scripts']:
        for file in sorted((ROOT/root).rglob('*')):
            if not file.is_file():continue
            relative=file.relative_to(ROOT)
            if any(part in EXCLUDED_DIRS for part in relative.parts):continue
            if file.name.startswith('.env') and file.name!='.env.example':continue
            if file.name=='local.properties' or (file.suffix.lower() in EXCLUDED_SUFFIX and file.name!='debug.keystore'):continue
            if file.name.startswith('roundtable-app-icon-v') and file.name!='roundtable-app-icon-v3.png':continue
            if file.name.startswith('roundtable-logo-lockup-v') and file.name!='roundtable-logo-lockup-v4.png':continue
            z.write(file,str(Path('roundtable-ai')/relative))
            files.append(str(relative))
    for filename in ['README.md','.gitignore']:
        z.write(ROOT/filename,'roundtable-ai/'+filename)
        files.append(filename)
assert not any(Path(x).name in ['.env','.env.local'] for x in files)
manifest={'sourceArchive':str(archive.name),'sourceFileCount':len(files),'sourceBytes':archive.stat().st_size,'sourceSha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'files':files,'excluded':'Server credentials, production signing keys, dependency folders, build outputs, media and historical unused brand variants','debugSigning':'Includes the starter Android debug.keystore for reproducible test builds; never for production signing'}
(OUT/'source-verification.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in manifest.items() if k!='files'},indent=2))
