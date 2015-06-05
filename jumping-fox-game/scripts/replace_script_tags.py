#!/usr/bin/python

import re, sys

if len(sys.argv) < 2:
    print 'More args needed.'
    exit

inputFile = open(sys.argv[1])
scriptFile = open(sys.argv[2])
data = inputFile.read()
scriptContent = scriptFile.read()

data = re.sub(r'<script.*></script>', '', data)
data = re.sub(r'<body>[\s]*</body>', ''.join(('<body><script>',scriptContent,'</script></body>')), data)

print data
