const MP_BASE_URL = "https://api.mercadopago.com";

function getAccessToken() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error("missing_mercadopago_access_token");
  }
  return token;
}

export async function createPreapproval({
  reason,
  payerEmail,
  externalReference,
  frequency,
  frequencyType,
  transactionAmount,
  backUrl,
}) {
  const response = await fetch(`${MP_BASE_URL}/preapproval`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reason,
      payer_email: payerEmail,
      auto_recurring: {
        frequency,
        frequency_type: frequencyType,
        transaction_amount: transactionAmount,
        currency_id: "BRL",
      },
      external_reference: externalReference,
      back_url: backUrl,
      status: "pending",
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data?.message || "mercadopago_error");
    error.details = data;
    throw error;
  }

  return data;
}

export async function getPreapproval(preapprovalId) {
  const response = await fetch(`${MP_BASE_URL}/preapproval/${preapprovalId}`, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data?.message || "mercadopago_error");
    error.details = data;
    throw error;
  }

  return data;
}
