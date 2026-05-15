(() => {
  // iClosed redirects to /booking-confirmed after a booking with params like:
  //   invitee_full_name, invitee_email, event_start_time, event_end_time,
  //   timeZone, assigned_to, event_type_name, externalCallId,
  //   text_reminder_number, answer_1 (phone or custom).
  //
  // We use invitee_full_name to personalise the headline. The iClosed
  // call-details widget loaded in the page handles host / time / time zone
  // / add-to-calendar buttons by itself.
  //
  // Meta Pixel / Google Ads / Meta CAPI conversion tracking is intentionally
  // not wired here yet. Anthony will set up the Acquiro pixel + ads accounts
  // first, then this script can be extended to fire Lead events (mirroring
  // the TBOF /booked.js pattern).

  const params = new URLSearchParams(location.search);
  const get = (...keys) => {
    for (const k of keys) {
      const v = params.get(k);
      if (v) return v.trim();
    }
    return null;
  };

  const fullName = get('invitee_full_name', 'name', 'full_name');
  const firstName = (() => {
    if (get('first_name')) return get('first_name');
    if (fullName) return fullName.split(/\s+/)[0];
    return null;
  })();

  if (firstName) {
    const nameEl = document.getElementById('b-name');
    if (nameEl) nameEl.textContent = ', ' + firstName;
  }
})();
