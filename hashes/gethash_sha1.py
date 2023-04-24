import hashlib
import sys
def hash_file(filename):
   """"This function returns the hash
   of the file passed into it"""

   # make a hash object
   sha_hash = hashlib.sha1()

   # open file for reading in binary mode
   with open(filename,'rb') as file:

       # loop till the end of the file
       chunk = 0
       while chunk != b'':
           # read only 1024 bytes at a time
           chunk = file.read(1024)
           sha_hash.update(chunk)

   # return the hex representation of digest
   return sha_hash.hexdigest()

filename = sys.argv[1]
filename = "./files/" + filename
message = hash_file(filename)
print(message)
sys.stdout.flush()