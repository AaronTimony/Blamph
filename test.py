from jamdict import Jamdict
jam = Jamdict()
result = jam.lookup('花見')
for entry in result.entries:
    for sense in entry.senses:
        print(str(sense.gloss[0]))

