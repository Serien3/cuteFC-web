import re


class Cigar:
    def __init__(self, cigar_string: str):
        self.cigar_string = cigar_string

    def items(self):
        return [(int(length), op) for length, op in re.findall(r"(\d+)([MIDNSHP=X])", self.cigar_string)]
