def checkBrackets(aString):
    aStack = []
    openings = ["(", "[", "{"]
    closings = [")", "]", "}"]
    
    for c in aString:
        if c in openings:
            aStack.append(c)
        else:
            if c in closings:
                reverseC = openings[closings.index(c)]
                if aStack[-1] == reverseC:
                    aStack.pop()
                else:
                    return False
                
    if aStack == []:
        return True
    else:
        return False
    
t = int(raw_input().strip())
for a0 in xrange(t):
    s = raw_input().strip()

    if checkBrackets(s):
        print "YES"
    else:
        print "NO"