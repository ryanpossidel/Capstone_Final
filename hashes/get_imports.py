import pefile
import sys

def imports(filename):
    filename = pefile.PE(filename)
    for item in filename.DIRECTORY_ENTRY_IMPORT:
        output = str(item.dll)
        output = output[2:]
        output = output[:-1]
        print(output)

    

filename = sys.argv[1]
filename = "./files/" + filename
imports(filename)
#print(message)
sys.stdout.flush()