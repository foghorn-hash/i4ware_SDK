<?php

// Original string with Scandinavian characters
$originalString = "Demokäyttäjä i4ware Software ISV";

// Encode from UTF-8 to ISO-8859-1
$encodedString = iconv('UTF-8', 'ISO-8859-15', $originalString);

// Output the results
echo "Original String: " . $originalString . PHP_EOL;
echo "Encoded String (ISO-8859-15): " . $encodedString . PHP_EOL;

// Print raw byte values for verification
echo "Raw Encoded Data (Hex): " . bin2hex($encodedString) . PHP_EOL;

// Display the encoded string in a way that might reveal hidden issues
echo "Encoded String as Binary Data: " . implode(' ', unpack('H*', $encodedString)) . PHP_EOL;

// Verify supported encodings
// echo "Supported Encodings: " . PHP_EOL;
// print_r(mb_list_encodings());
?>
