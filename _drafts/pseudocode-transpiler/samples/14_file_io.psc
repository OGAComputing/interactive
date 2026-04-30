myFile = openRead("data.txt")
while NOT myFile.endOfFile()
    line = myFile.readLine()
    print(line)
endwhile
myFile.close()

outFile = openWrite("out.txt")
outFile.writeLine("written line 1")
outFile.writeLine("written line 2")
outFile.close()
