import pefile
import sys

def imphash(filename):
    file = pefile.PE(filename)
    return file.get_imphash()


filename = sys.argv[1]
filename = "./files/" + filename
message = imphash(filename)
print(message)
sys.stdout.flush()