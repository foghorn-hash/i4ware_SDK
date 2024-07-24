<?php

// app/Services/NetvisorAPI.php

namespace App\Services;

class NetvisorAPI
{
    private $baseUrl;
    private $sender;
    private $customerId;
    private $timestamp;
    private $language;
    private $organisationId;
    private $transactionId;
    private $customerKey;
    private $partnerKey;
    private $partnerId;

    public function __construct($baseUrl, $sender, $customerId, $timestamp, $language, $organisationId, $transactionId, $customerKey, $partnerKey, $partnerId)
    {
        $this->baseUrl = $baseUrl;
        $this->sender = $sender;
        $this->customerId = $customerId;
        $this->timestamp = $timestamp;
        $this->language = $language;
        $this->organisationId = $organisationId;
        $this->transactionId = $transactionId;
        $this->customerKey = $customerKey;
        $this->partnerKey = $partnerKey;
        $this->partnerId = $partnerId;
    }

    private function getMAC($url)
    {
        $parameters = array(
            $url,
            $this->sender,
            $this->customerId,
            $this->timestamp,
            $this->language,
            $this->organisationId,
            $this->transactionId,
            $this->customerKey,
            $this->partnerKey
        );

        $parameters = array_map("strval", $parameters);
        return hash("sha256", implode("", $parameters));
    }

    private function getAuthenticationHeaders($url)
    {
        $mac = $this->getMAC($url);

        $headers = array(
            "X-Netvisor-Authentication-Sender: " . $this->sender,
            "X-Netvisor-Authentication-CustomerId: " . $this->customerId,
            "X-Netvisor-Authentication-PartnerId: " . $this->partnerId,
            "X-Netvisor-Authentication-Timestamp: " . $this->timestamp,
            "X-Netvisor-Authentication-TransactionId: " . $this->transactionId,
            "X-Netvisor-Interface-Language: " . $this->language,
            "X-Netvisor-Organisation-ID: " . $this->organisationId,
            "X-Netvisor-Authentication-MAC: " . $mac,
            "X-Netvisor-Authentication-MACHashCalculationAlgorithm: SHA256",
        );

        return $headers;
    }

    public function makeRequest($endpoint, $data = null)
    {
        $url = $this->baseUrl . $endpoint;
        $headers = $this->getAuthenticationHeaders($url);

        $ch = curl_init($url);

        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        if ($data) {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        }

        $response = curl_exec($ch);

        if (curl_errno($ch)) {
            return ['error' => curl_error($ch)];
        } else {
            return json_decode($response, true);
        }

        curl_close($ch);
    }
}

