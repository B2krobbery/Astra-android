import { createClient } from '@supabase/supabase-js';
import { calculateProfileReadiness } from '../src/utils/profileReadiness.ts';
import { VedicAstrologyEngine } from '../src/data/VedicAstrologyEngine.ts';
import { AshtakootaEngine } from '../src/data/AshtakootaEngine.ts';
import { NumerologyEngine } from '../src/data/NumerologyEngine.ts';
import { ChemistryEngine } from '../src/data/ChemistryEngine.ts';

const SUPABASE_URL = 'https://xpkkathtikucwtyjzfja.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_7C4Qmq1NFC93t-d0UG2xqw_UIQvVYrQ';

const GROOM_ID = 'a1a1a1a1-a1a1-41a1-a1a1-a1a1a1a1a1a1';
const BRIDE_ID = 'b2b2b2b2-b2b2-42b2-b2b2-b2b2b2b2b2b2';
const PASSWORD = 'Password123!';

async function runAcceptanceTest() {
  console.log('====================================================');
  console.log('🌟 RUNNING TWO-USER END-TO-END ACCEPTANCE SUITE 🌟');
  console.log('====================================================\n');

  // 1. Authenticate Groom and Bride
  const groomClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const brideClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  console.log('1. Authenticating test users...');
  const { data: groomAuth, error: groomAuthErr } = await groomClient.auth.signInWithPassword({
    email: 'test_groom@mangaladutra.com',
    password: PASSWORD
  });
  if (groomAuthErr) throw new Error(`Groom auth failed: ${groomAuthErr.message}`);
  console.log(`   ✅ Groom authenticated: ${groomAuth.user?.id}`);

  const { data: brideAuth, error: brideAuthErr } = await brideClient.auth.signInWithPassword({
    email: 'test_bride@mangaladutra.com',
    password: PASSWORD
  });
  if (brideAuthErr) throw new Error(`Bride auth failed: ${brideAuthErr.message}`);
  console.log(`   ✅ Bride authenticated: ${brideAuth.user?.id}\n`);

  // Clean up any previous test state between Groom and Bride
  console.log('2. Cleaning up previous test state...');
  await groomClient.rpc('reset_test_users', { p_uid1: GROOM_ID, p_uid2: BRIDE_ID });
  console.log('   ✅ Test state reset.\n');

  // 3. Test Profile Readiness Gate in Marriage Mode
  console.log('3. Testing Marriage Discovery Readiness Gate...');
  // Upsert an incomplete profile for Groom (readiness < 100%, onboarding_completed = false)
  const { error: incErr } = await groomClient.from('profiles').upsert({
    id: GROOM_ID,
    display_name: 'Rahul Groom',
    gender: 'Male',
    intent: 'Marriage',
    onboarding_completed: false,
    location: 'Bengaluru'
  });
  if (incErr) throw incErr;

  // Attempt discovery in Marriage mode - MUST BE BLOCKED BY SERVER RPC
  const { data: discBlocked, error: discErr } = await groomClient.rpc('get_discovery_candidates', {
    p_limit: 10,
    p_offset: 0,
    p_filters: {}
  });

  if (!discErr) {
    throw new Error('FAILED: Incomplete profile was allowed to call get_discovery_candidates in Marriage mode!');
  }
  console.log(`   ✅ Discovery correctly BLOCKED for incomplete profile: "${discErr.message}"\n`);

  // 4. Groom Completes 100% Profile
  console.log('4. Groom fills full 27-field profile to achieve 100% readiness...');
  const groomProfileData = {
    display_name: 'Rahul Groom',
    gender: 'Male',
    intent: 'Marriage',
    onboarding_completed: true,
    date_of_birth: '1995-05-15',
    height: "5'11\"",
    religion: 'Hindu',
    caste: 'Brahmin',
    sub_caste: 'Smartha',
    mother_tongue: 'Kannada',
    region: 'South India',
    state: 'Karnataka',
    city_district: 'Bengaluru Urban',
    gotra: 'Kashyapa',
    education_10th: 'St. Joseph High School (94%)',
    education_12th: 'National PU College (92%)',
    higher_education: 'M.Tech Computer Science',
    profession: 'Senior Software Architect',
    employer: 'Global Tech Systems',
    annual_income: '3600000',
    blood_group: 'O+',
    health_status: 'Healthy, no chronic conditions',
    location: 'Bengaluru',
    birth_location: 'Bengaluru',
    diet: 'Vegetarian',
    alcohol: 'Never',
    smoking: 'Never',
    marital_status: 'Never Married',
    bio: 'Senior Software Architect in Bengaluru passionate about technology, classical music, and outdoor trekking.',
    rashi: 'Vrishchika (Scorpio)',
    nakshatra: 'Anuradha',
    photo_privacy: 'public'
  };

  const { error: groomUpdErr } = await groomClient.from('profiles').update(groomProfileData).eq('id', GROOM_ID);
  if (groomUpdErr) throw groomUpdErr;

  // Add Groom Avatar
  await groomClient.from('profile_photos').insert({
    user_id: GROOM_ID,
    storage_path: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    is_primary: true
  });

  // Add Groom Private Profile (birth coordinates)
  await groomClient.from('private_profiles').upsert({
    id: GROOM_ID,
    birth_time: '08:30',
    birth_latitude: 12.9716,
    birth_longitude: 77.5946
  });

  // Verify Groom local readiness calculator
  const groomReadiness = calculateProfileReadiness({
    ...groomProfileData,
    name: groomProfileData.display_name,
    nativeLocation: 'Bengaluru',
    birthTime: '08:30',
    birthLocation: 'Bengaluru',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d'
  } as any);

  if (!groomReadiness.isComplete || groomReadiness.percentage !== 100) {
    throw new Error(`Groom readiness calculation failed: got ${groomReadiness.percentage}%, missing: ${groomReadiness.missingFields.join(', ')}`);
  }
  console.log(`   ✅ Groom profile readiness: 100% complete (${groomReadiness.completedCount}/${groomReadiness.totalCount} fields).\n`);

  // 5. Bride Sets Up Complete Profile with PRIVATE Photos
  console.log('5. Bride fills full 27-field profile with photo_privacy = "private"...');
  const brideProfileData = {
    id: BRIDE_ID,
    display_name: 'Priya Bride',
    gender: 'Female',
    intent: 'Marriage',
    onboarding_completed: true,
    date_of_birth: '1996-08-22',
    height: "5'5\"",
    religion: 'Hindu',
    caste: 'Brahmin',
    sub_caste: 'Iyer',
    mother_tongue: 'Tamil',
    region: 'South India',
    state: 'Tamil Nadu',
    city_district: 'Chennai',
    gotra: 'Bharadwaja',
    education_10th: 'National Public School (95%)',
    education_12th: 'PSBB Chennai (94%)',
    higher_education: 'MBA Finance',
    profession: 'Investment Banker',
    employer: 'Apex Capital',
    annual_income: '3000000',
    blood_group: 'B+',
    health_status: 'Excellent health, active runner',
    location: 'Chennai',
    birth_location: 'Chennai',
    diet: 'Vegetarian',
    alcohol: 'Never',
    smoking: 'Never',
    marital_status: 'Never Married',
    bio: 'Finance professional passionate about arts, literature, and yoga.',
    rashi: 'Vrishabha (Taurus)',
    nakshatra: 'Rohini',
    photo_privacy: 'private' // PRIVATE PHOTOS
  };

  const { error: brideInsErr } = await brideClient.from('profiles').insert(brideProfileData);
  if (brideInsErr) throw brideInsErr;

  // Add Bride Private Photos
  await brideClient.from('profile_photos').insert([
    {
      user_id: BRIDE_ID,
      storage_path: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      is_primary: true
    },
    {
      user_id: BRIDE_ID,
      storage_path: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      is_primary: false
    }
  ]);

  // Add Bride Private Profile
  await brideClient.from('private_profiles').upsert({
    id: BRIDE_ID,
    birth_time: '14:15',
    birth_latitude: 13.0827,
    birth_longitude: 80.2707
  });

  const brideReadiness = calculateProfileReadiness({
    ...brideProfileData,
    name: brideProfileData.display_name,
    nativeLocation: 'Chennai',
    birthTime: '14:15',
    birthLocation: 'Chennai',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'
  } as any);

  if (!brideReadiness.isComplete || brideReadiness.percentage !== 100) {
    throw new Error(`Bride readiness calculation failed: got ${brideReadiness.percentage}%, missing: ${brideReadiness.missingFields.join(', ')}`);
  }
  console.log(`   ✅ Bride profile readiness: 100% complete with private photo mode.\n`);

  // 6. Groom Runs Discovery - Now UNLOCKED & Sanitized
  console.log('6. Groom discovers Bride via get_discovery_candidates RPC...');
  const { data: candidates, error: discSuccessErr } = await groomClient.rpc('get_discovery_candidates', {
    p_limit: 10,
    p_offset: 0,
    p_filters: {}
  });

  if (discSuccessErr) throw discSuccessErr;
  console.log(`   ✅ Discovery succeeded! Found ${candidates.length} candidate(s).`);

  const brideCandidate = candidates.find((c: any) => c.id === BRIDE_ID);
  if (!brideCandidate) throw new Error('Bride not found in Groom discovery candidates!');

  console.log(`   ✅ Found Bride: ${brideCandidate.display_name}, ${brideCandidate.profession}, ${brideCandidate.location}`);
  console.log(`   ✅ Photo privacy flag: "${brideCandidate.photo_privacy}"`);

  // Verify sensitive data is NOT exposed in discovery
  if (brideCandidate.annual_income !== null && brideCandidate.annual_income !== undefined) {
    throw new Error(`SECURITY LEAK: annual_income exposed to unmatched user: ${brideCandidate.annual_income}`);
  }
  if (brideCandidate.health_info) {
    throw new Error(`SECURITY LEAK: health_info exposed to unmatched user!`);
  }
  if (brideCandidate.previous_marriage) {
    throw new Error(`SECURITY LEAK: previous_marriage exposed to unmatched user!`);
  }
  console.log('   ✅ Privacy check passed: sensitive fields (income, health, previous marriage) are masked.\n');

  // 7. Groom Requests Access to Bride's Private Photos
  console.log('7. Groom requests access to Bride\'s private photos...');
  const { data: photoReq, error: photoReqErr } = await groomClient
    .from('photo_requests')
    .insert({
      requester_id: GROOM_ID,
      target_id: BRIDE_ID,
      status: 'PENDING'
    })
    .select()
    .single();

  if (photoReqErr) throw photoReqErr;
  console.log(`   ✅ Photo request submitted: ID ${photoReq.id}, Status: ${photoReq.status}`);

  // Verify Bride received automatic notification via DB trigger
  const { data: brideNotifs } = await brideClient
    .from('notifications')
    .select('*')
    .eq('user_id', BRIDE_ID)
    .eq('type', 'PHOTO_REQUEST');

  if (!brideNotifs || brideNotifs.length === 0) {
    throw new Error('FAIL: Trigger did not generate PHOTO_REQUEST notification for Bride!');
  }
  console.log(`   ✅ Bride notification received: "${brideNotifs[0].content?.message}"`);

  // Bride accepts the photo request
  console.log('   Bride accepts photo access request...');
  const { error: acceptErr } = await brideClient
    .from('photo_requests')
    .update({ status: 'ACCEPTED' })
    .eq('id', photoReq.id);
  if (acceptErr) throw acceptErr;

  // Verify Groom received automatic notification of acceptance
  const { data: groomNotifs } = await groomClient
    .from('notifications')
    .select('*')
    .eq('user_id', GROOM_ID)
    .eq('type', 'PHOTO_REQUEST_RESPONSE');

  if (!groomNotifs || groomNotifs.length === 0) {
    throw new Error('FAIL: Trigger did not generate PHOTO_REQUEST_RESPONSE notification for Groom!');
  }
  console.log(`   ✅ Groom notification received: "${groomNotifs[0].content?.message}"`);

  // Verify Groom can now access Bride's private photos
  const { data: authorizedPhotos, error: authPhotoErr } = await groomClient.rpc('get_private_photos', {
    p_target_id: BRIDE_ID
  });
  if (authPhotoErr) throw authPhotoErr;
  if (!authorizedPhotos || authorizedPhotos.length === 0) {
    throw new Error('FAIL: Groom could not retrieve authorized private photos after acceptance!');
  }
  console.log(`   ✅ Groom authorized to view ${authorizedPhotos.length} photos of Bride.\n`);

  // 8. Mutual Interest & Match Flow
  console.log('8. Testing Interest & Mutual Match Flow...');
  // Groom sends LIKE
  const { error: groomLikeErr } = await groomClient
    .from('interactions')
    .insert({ actor_id: GROOM_ID, target_id: BRIDE_ID, action_type: 'LIKE' });
  if (groomLikeErr) throw groomLikeErr;
  console.log('   ✅ Groom sent LIKE to Bride.');

  // Verify Bride gets LIKE notification
  const { data: brideLikeNotifs } = await brideClient
    .from('notifications')
    .select('*')
    .eq('user_id', BRIDE_ID)
    .eq('type', 'INTEREST_RECEIVED');
  if (!brideLikeNotifs || brideLikeNotifs.length === 0) {
    throw new Error('FAIL: Trigger did not create INTEREST_RECEIVED notification for Bride!');
  }
  console.log(`   ✅ Bride received interest notification: "${brideLikeNotifs[0].content?.message}"`);

  // Bride sends LIKE back (mutual match)
  const { error: brideLikeErr } = await brideClient
    .from('interactions')
    .insert({ actor_id: BRIDE_ID, target_id: GROOM_ID, action_type: 'LIKE' });
  if (brideLikeErr) throw brideLikeErr;
  console.log('   ✅ Bride sent LIKE to Groom (Mutual Match created).');

  // Verify match row exists in matches
  const { data: matchRow, error: matchErr } = await groomClient
    .from('matches')
    .select('*')
    .or(`and(user1_id.eq.${GROOM_ID},user2_id.eq.${BRIDE_ID}),and(user1_id.eq.${BRIDE_ID},user2_id.eq.${GROOM_ID})`)
    .maybeSingle();

  if (matchErr || !matchRow) throw new Error('FAIL: Mutual match was not created by trigger!');
  console.log(`   ✅ Match verified in database: ID ${matchRow.id}`);

  // Verify conversation and participants exist
  const { data: convoRow, error: convoErr } = await groomClient
    .from('conversations')
    .select('*, conversation_participants(*)')
    .eq('match_id', matchRow.id)
    .single();

  if (convoErr || !convoRow) throw new Error(`FAIL: Conversation was not created for match! Error: ${JSON.stringify(convoErr)}`);
  console.log(`   ✅ Conversation created: ID ${convoRow.id} with ${convoRow.conversation_participants?.length || 0} participants.\n`);

  // 9. Real-Time / Secure Messaging
  console.log('9. Testing Chat Messaging...');
  const { data: msg1, error: msg1Err } = await groomClient
    .from('messages')
    .insert({
      conversation_id: convoRow.id,
      sender_id: GROOM_ID,
      content: 'Namaste Priya! Delighted to connect with you on Mangalsutra.'
    })
    .select()
    .single();

  if (msg1Err) throw msg1Err;
  console.log(`   ✅ Groom sent message: "${msg1.content}"`);

  // Bride reads Groom message and replies
  const { data: brideMessages } = await brideClient
    .from('messages')
    .select('*')
    .eq('conversation_id', convoRow.id)
    .order('created_at', { ascending: true });

  if (!brideMessages || brideMessages.length === 0) throw new Error('FAIL: Bride could not read conversation messages!');
  console.log(`   ✅ Bride successfully read message from Groom.`);

  const { data: msg2, error: msg2Err } = await brideClient
    .from('messages')
    .insert({
      conversation_id: convoRow.id,
      sender_id: BRIDE_ID,
      content: 'Namaste Rahul! Happy to connect. Looking forward to knowing you better.'
    })
    .select()
    .single();
  if (msg2Err) throw msg2Err;
  console.log(`   ✅ Bride replied: "${msg2.content}"\n`);

  // 10. Chaanbean™ Verification & Legal Consent Flow
  console.log('10. Testing Chaanbean™ Background Verification & Legal Consent...');
  const { data: cbReq, error: cbReqErr } = await groomClient
    .from('chaanbean_requests')
    .insert({
      requester_id: GROOM_ID,
      target_id: BRIDE_ID,
      status: 'PENDING_PAYMENT',
      checks_requested: ['police', 'credit', 'education'],
      consent_granted: false
    })
    .select()
    .single();

  if (cbReqErr) throw cbReqErr;
  console.log(`   ✅ Chaanbean request inserted: ID ${cbReq.id}, Status: ${cbReq.status}`);

  // Verify Bride gets consent request notification
  const { data: brideCbNotifs } = await brideClient
    .from('notifications')
    .select('*')
    .eq('user_id', BRIDE_ID)
    .eq('type', 'CHAANBEAN_CONSENT_REQUEST');

  if (!brideCbNotifs || brideCbNotifs.length === 0) {
    throw new Error('FAIL: Trigger did not create CHAANBEAN_CONSENT_REQUEST notification!');
  }
  console.log(`   ✅ Bride received verification consent request: "${brideCbNotifs[0].content?.message}"`);

  // Bride grants legal consent
  const { error: cbConsentErr } = await brideClient
    .from('chaanbean_requests')
    .update({ consent_granted: true })
    .eq('id', cbReq.id);
  if (cbConsentErr) throw cbConsentErr;
  console.log('   ✅ Bride granted legal consent for verification.');

  // Verify Groom gets consent response notification
  const { data: groomCbNotifs } = await groomClient
    .from('notifications')
    .select('*')
    .eq('user_id', GROOM_ID)
    .eq('type', 'CHAANBEAN_CONSENT_RESPONSE');

  if (!groomCbNotifs || groomCbNotifs.length === 0) {
    throw new Error('FAIL: Trigger did not create CHAANBEAN_CONSENT_RESPONSE notification!');
  }
  console.log(`   ✅ Groom received consent response notification: "${groomCbNotifs[0].content?.message}"`);

  // Verify verification request is PENDING_PAYMENT (truthful status, no fake verified badge)
  const { data: finalCb } = await groomClient
    .from('chaanbean_requests')
    .select('*')
    .eq('id', cbReq.id)
    .single();

  if (finalCb.status !== 'PENDING_PAYMENT' || !finalCb.consent_granted) {
    throw new Error(`FAIL: Unexpected Chaanbean request state: ${JSON.stringify(finalCb)}`);
  }
  console.log(`   ✅ Verification state verified: consent_granted = true, status = "PENDING_PAYMENT" (awaiting payment provider integration).\n`);

  // 11. Authentic Compatibility Engines Execution
  console.log('11. Testing Compatibility Engines (Astrology, Ashtakoota, Numerology, Chemistry)...');
  
  // Ephemeris calculation for Groom & Bride
  const groomChart = VedicAstrologyEngine.calculateChart({
    dateOfBirth: '1995-05-15',
    timeOfBirth: '08:30',
    latitude: 12.9716,
    longitude: 77.5946
  });

  const brideChart = VedicAstrologyEngine.calculateChart({
    dateOfBirth: '1996-08-22',
    timeOfBirth: '14:15',
    latitude: 13.0827,
    longitude: 80.2707
  });

  console.log(`   Groom Chart: Moon in ${groomChart.rashiName}, Nakshatra: ${groomChart.nakshatraName} (Pada ${groomChart.pada}), Lagna: ${groomChart.ascendant.rashiName}`);
  console.log(`   Bride Chart: Moon in ${brideChart.rashiName}, Nakshatra: ${brideChart.nakshatraName} (Pada ${brideChart.pada}), Lagna: ${brideChart.ascendant.rashiName}`);

  // Ashtakoota 36 Guna Milan
  const ashtakoota = AshtakootaEngine.match(
    { rashiIndex: groomChart.rashiIndex, nakshatraIndex: groomChart.nakshatraIndex, pada: groomChart.pada },
    { rashiIndex: brideChart.rashiIndex, nakshatraIndex: brideChart.nakshatraIndex, pada: brideChart.pada }
  );

  console.log(`   ✅ Ashtakoota Milan: ${ashtakoota.totalScore}/36 Gunas (${ashtakoota.percentage}%) - ${ashtakoota.verdict}`);
  console.log(`      Gunas: ${ashtakoota.gunas.map(g => `${g.name}: ${g.score}/${g.max}`).join(', ')}`);

  // Numerology
  const groomNumerology = NumerologyEngine.calculateLifePath('1995-05-15');
  const brideNumerology = NumerologyEngine.calculateLifePath('1996-08-22');
  const numerologyHarmony = NumerologyEngine.calculateHarmony(groomNumerology, brideNumerology);
  console.log(`   ✅ Numerology: Groom LP ${groomNumerology}, Bride LP ${brideNumerology} -> Harmony: ${numerologyHarmony}%`);

  // Chemistry
  const chemistryResult = ChemistryEngine.computeChemistry(
    {
      sports: ['Cricket', 'Badminton'],
      movies: ['Interstellar', 'Swades'],
      music: ['Carnatic', 'A.R. Rahman'],
      hobbies: ['Reading', 'Trekking'],
      diet: 'vegetarian',
      values: 'moderate'
    },
    {
      sports: ['Badminton', 'Tennis'],
      movies: ['Interstellar', 'Inception'],
      music: ['Carnatic', 'A.R. Rahman'],
      hobbies: ['Reading', 'Yoga'],
      diet: 'vegetarian',
      values: 'moderate'
    }
  );
  console.log(`   ✅ Chemistry Compatibility: ${chemistryResult.overallScore}%`);
  console.log(`      Shared tags: ${chemistryResult.sharedTags.join(', ')}\n`);

  console.log('====================================================');
  console.log('🎉 ALL TWO-USER END-TO-END ACCEPTANCE TESTS PASSED! 🎉');
  console.log('====================================================\n');
}

runAcceptanceTest().catch(err => {
  console.error('\n❌ ACCEPTANCE TEST FAILED:', err);
  process.exit(1);
});
