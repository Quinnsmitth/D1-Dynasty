
/* D1 Dynasty: Firebase authentication and private draft stats.
   Requires Firebase compat globals: auth, db, firebase.
*/

(function () {
  'use strict';

  let currentUser = null;
  let statsBusy = false;
  let creatingAccount = false;
  let authReadyResolved = false;

  let resolveAuthReady;

  const authReady = new Promise(resolve => {
    resolveAuthReady = resolve;
  });

  // Prevent the same result object from being saved more than once.
  const savePromises = new WeakMap();

  const $ = id => document.getElementById(id);

  const modal = () => $('accountModal');

  const hasFirebase = () =>
    typeof auth !== 'undefined' &&
    typeof db !== 'undefined' &&
    typeof firebase !== 'undefined';

  const message = (id, text) => {
    const el = $(id);
    if (el) el.textContent = text || '';
  };

  const setButtonDisabled = (id, disabled) => {
    const el = $(id);
    if (el) el.disabled = disabled;
  };

  function friendlyError(error) {
    const errors = {
      'auth/invalid-email': 'That email address is invalid.',
      'auth/user-not-found': 'No account was found for that email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/invalid-credential': 'Email or password is incorrect.',
      'auth/email-already-in-use': 'That email already has an account.',
      'auth/weak-password': 'Use a password with at least 6 characters.',
      'auth/too-many-requests': 'Too many attempts. Try again later.',
      'auth/network-request-failed': 'Network error. Check your connection.',
      'permission-denied': 'Firestore security rules denied this operation.',
      'unavailable': 'Firestore is temporarily unavailable.',
      'deadline-exceeded': 'Firestore took too long to respond.'
    };

    return errors[error?.code] ||
      error?.message ||
      'Something went wrong.';
  }

  function openLogin() {
    if (!hasFirebase()) {
      message('accountError', 'Firebase is not configured.');
      modal()?.classList.add('open');
      return;
    }

    creatingAccount = false;
    renderAuthMode();
    message('accountError', '');
    modal()?.classList.add('open');

    setTimeout(() => $('accountEmail')?.focus(), 0);
  }

  function closeLogin() {
    modal()?.classList.remove('open');
  }

  function renderAuthMode() {
    message('accountTitle',
      creatingAccount ? 'JOIN THE DYNASTY' : 'YOUR DYNASTY'
    );

    message('accountDescription',
      creatingAccount
        ? 'Create an account to keep your draft history across devices.'
        : 'Log in to save your draft history and stats.'
    );

    message('accountSubmit',
      creatingAccount ? 'Create account' : 'Log in'
    );

    message('accountSwitchText',
      creatingAccount ? 'Already have an account?' : 'New here?'
    );

    message('accountSwitch',
      creatingAccount ? 'Log in' : 'Create account'
    );

    const password = $('accountPassword');

    if (password) {
      password.autocomplete = creatingAccount
        ? 'new-password'
        : 'current-password';
    }
  }

  // ACCOUNT BUTTONS

  $('accountOpen')?.addEventListener('click', () => {
    if (currentUser) {
      show('stats');
      loadStats();
    } else {
      openLogin();
    }
  });

  $('statsOpen')?.addEventListener('click', () => {
    show('stats');
    loadStats();
  });

  $('statsBack')?.addEventListener('click', () => {
    renderHome();
    show('home');
  });

  $('accountCancel')?.addEventListener('click', closeLogin);

  $('accountSwitch')?.addEventListener('click', () => {
    creatingAccount = !creatingAccount;
    renderAuthMode();
    message('accountError', '');
  });

  modal()?.addEventListener('click', event => {
    if (event.target === modal()) closeLogin();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeLogin();
  });

  // LOGIN AND SIGNUP

  $('accountForm')?.addEventListener('submit', async event => {
    event.preventDefault();

    if (!hasFirebase()) {
      message('accountError', 'Firebase is not configured.');
      return;
    }

    const email = $('accountEmail')?.value.trim();
    const password = $('accountPassword')?.value;

    if (!email || !password) {
      message('accountError', 'Enter your email and password.');
      return;
    }

    setButtonDisabled('accountSubmit', true);
    message('accountError', '');

    try {
      if (creatingAccount) {
        const credential = await auth.createUserWithEmailAndPassword(
          email,
          password
        );

        console.log('D1 AUTH: Account created:', credential.user.uid);

        // Profile creation is separate from Firebase Authentication.
        await db.collection('users')
          .doc(credential.user.uid)
          .set({
            email: credential.user.email || email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true });

        console.log('D1 AUTH: User profile created.');

      } else {
        await auth.signInWithEmailAndPassword(email, password);
        console.log('D1 AUTH: Login successful.');
      }

      closeLogin();
      show('stats');
      await loadStats();

    } catch (error) {
      console.error('D1 AUTH ERROR:', error);
      message('accountError', friendlyError(error));

    } finally {
      setButtonDisabled('accountSubmit', false);
    }
  });

  // LOGOUT

  $('accountLogout')?.addEventListener('click', async () => {
    if (!hasFirebase()) return;

    try {
      await auth.signOut();
      renderHome();
      show('home');

    } catch (error) {
      console.error('D1 LOGOUT ERROR:', error);
      message('statsSubtitle', 'Could not log out: ' + friendlyError(error));
    }
  });

  // REFRESH STATS

  $('statsRefresh')?.addEventListener('click', loadStats);

  // AUTHENTICATION STATE

  if (hasFirebase()) {
    auth.onAuthStateChanged(
      user => {
        currentUser = user;

        if (!authReadyResolved) {
          authReadyResolved = true;
          resolveAuthReady(user);
        }

        const accountButton = $('accountOpen');
        const statsButton = $('statsOpen');
        const logoutButton = $('accountLogout');

        if (user) {
          if (accountButton) accountButton.textContent = 'My account';
          if (statsButton) statsButton.textContent = 'My stats';

          message(
            'accountStatus',
            'Signed in as ' + (user.email || 'wrestling fan') +
              ' · drafts save automatically'
          );

          if (logoutButton) logoutButton.style.display = 'inline-block';

        } else {
          if (accountButton) accountButton.textContent = 'Log in / Sign up';
          if (statsButton) statsButton.textContent = 'My stats';

          message(
            'accountStatus',
            'Sign in to save your drafts and track your dynasty.'
          );

          if (logoutButton) logoutButton.style.display = 'none';
        }

        if ($('stats')?.classList.contains('on')) {
          loadStats();
        }
      },
      error => {
        console.error('D1 AUTH STATE ERROR:', error);

        if (!authReadyResolved) {
          authReadyResolved = true;
          resolveAuthReady(null);
        }
      }
    );

  } else {
    authReadyResolved = true;
    resolveAuthReady(null);

    message(
      'accountStatus',
      'Set up Firebase to enable accounts and cloud stats.'
    );
  }

  // HELPERS FOR SAVED DATA

  function finiteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function buildDraftRecord(result) {
    if (!result || !Number.isFinite(Number(result.score))) {
      throw new Error('The draft result has no valid score.');
    }

    if (
      typeof G === 'undefined' ||
      !G ||
      !Array.isArray(G.picks) ||
      G.picks.length === 0
    ) {
      throw new Error('Game state or wrestler picks are missing.');
    }

    const picks = G.picks.filter(Boolean).map(p => {
      if (!p || !p.t) {
        throw new Error('A wrestler pick is missing team information.');
      }

      return {
        weight: p.w ?? null,
        name: p.n ?? null,
        team: p.t.team ?? null,
        year: p.t.y ?? null,
        finish: p.pl ?? null,
        points: finiteNumber(p.pts)
      };
    });

    if (picks.length !== G.picks.filter(Boolean).length || !picks.length) {
      throw new Error('The wrestler picks could not be saved.');
    }

    const domain =
      typeof DOM !== 'undefined' && DOM === 'uww'
        ? 'freestyle'
        : 'ncaa';

    const accuracy = result.acc?.pct;
    const correctPicks = result.acc?.n;

    const coach = G.coach
      ? {
          name: G.coach.n ?? null,
          team: G.coach.team ?? null,
          year: G.coach.y ?? null
        }
      : null;

    return {
      score: finiteNumber(result.score),

      grade: typeof gradeOf === 'function'
        ? gradeOf(result.score)
        : '—',

      allAmericans: finiteNumber(result.aa),

      mode: typeof cfg !== 'undefined'
        ? (
            domain === 'freestyle'
              ? cfg.umode
              : cfg.mode
          ) || 'hard'
        : 'hard',

      gameType: G.daily
        ? 'daily'
        : domain === 'freestyle'
          ? 'freestyle'
          : (
              typeof cfg !== 'undefined' && cfg.play
            ) || 'classic',

      domain,

      accuracy: accuracy == null
        ? null
        : finiteNumber(accuracy, null),

      correctPicks: correctPicks == null
        ? null
        : finiteNumber(correctPicks, null),

      coach,
      picks,

      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
  }

  // SAVE COMPLETED DRAFT

  async function performDraftSave(result) {
    if (!hasFirebase()) {
      throw new Error('Firebase is not initialized.');
    }

    await authReady;

    const user = auth.currentUser || currentUser;

    if (!user) {
      throw new Error('No signed-in user. Log in before finishing a draft.');
    }

    const record = buildDraftRecord(result);

    const userRef = db.collection('users').doc(user.uid);
    const draftRef = userRef.collection('drafts').doc();

    console.log('D1 SAVE: Writing draft:', draftRef.path);
    console.log('D1 SAVE: Record:', record);

    // Await the actual Firestore operation. Do not assume that a timeout
    // cancels a write; it does not.
    await draftRef.set(record);

    console.log('D1 SAVE: Draft successfully saved.');

    await userRef.set({
      email: user.email || null,
      lastDraftAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log('D1 SAVE: User profile updated.');

    message('statsSubtitle', 'Draft saved to your account.');

    return true;
  }

  window.saveDraftResult = function (result) {
    if (!result || typeof result !== 'object') {
      console.error('D1 SAVE: Invalid result object.');
      return Promise.resolve(false);
    }

    // Reuse the same promise if this exact result object is submitted again.
    const existing = savePromises.get(result);
    if (existing) return existing;

    const savePromise = performDraftSave(result)
      .catch(error => {
        console.error('D1 SAVE ERROR:', error.code, error.message, error);

        message(
          'statsSubtitle',
          'Save failed: ' + friendlyError(error)
        );

        return false;
      });

    savePromises.set(result, savePromise);

    return savePromise;
  };

  // LOAD CAREER STATS

  async function loadStats() {
    const history = $('statsHistory');

    if (!history || statsBusy) return;

    const user = currentUser ||
      (hasFirebase() ? auth.currentUser : null);

    if (!user || !hasFirebase()) {
      message('statsSubtitle', 'Log in to build your personal draft record.');

      ['statDrafts', 'statAverage', 'statBest', 'statGrade']
        .forEach(id => message(id, '—'));

      history.className = 'stats-empty';
      history.textContent =
        'Log in or create an account to start tracking drafts.';

      return;
    }

    statsBusy = true;
    history.className = 'stats-empty';
    history.textContent = 'Loading your draft history…';

    try {
      const snapshot = await db.collection('users')
        .doc(user.uid)
        .collection('drafts')
        .orderBy('createdAt', 'desc')
        .limit(100)
        .get();

      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (!records.length) {
        ['statDrafts', 'statAverage', 'statBest']
          .forEach(id => message(id, '0'));

        message('statGrade', '—');

        history.className = 'stats-empty';
        history.textContent =
          'No completed drafts saved yet. Finish a draft while logged in and it will show up here.';

        message('statsSubtitle', 'Your saved results will appear here.');
        return;
      }

      const scores = records.map(record =>
        finiteNumber(record.score)
      );

      const average =
        scores.reduce((sum, score) => sum + score, 0) /
        scores.length;

      const best = records.reduce((a, b) =>
        finiteNumber(b.score) > finiteNumber(a.score) ? b : a
      );

      message('statDrafts', String(records.length));
      message('statAverage', average.toFixed(1));
      message('statBest', String(best.score));
      message('statGrade', best.grade || '—');

      const table = document.createElement('div');
      table.className = 'stats-table-wrap';

      const tbl = document.createElement('table');
      tbl.className = 'stats-table';

      tbl.innerHTML =
        '<thead><tr>' +
        '<th>Date</th>' +
        '<th>Mode</th>' +
        '<th>Score</th>' +
        '<th>Grade</th>' +
        '<th>AA / medals</th>' +
        '</tr></thead>';

      const body = document.createElement('tbody');

      records.forEach(record => {
        const tr = document.createElement('tr');

        const date = record.createdAt?.toDate
          ? record.createdAt.toDate().toLocaleDateString()
          : 'Recent';

        const modeLabel = [
          record.gameType || 'classic',
          record.mode || 'hard'
        ].join(' · ');

        [
          date,
          modeLabel,
          String(record.score ?? '—'),
          record.grade || '—',
          String(record.allAmericans ?? '—')
        ].forEach(value => {
          const td = document.createElement('td');
          td.textContent = value;
          tr.appendChild(td);
        });

        body.appendChild(tr);
      });

      tbl.appendChild(body);
      table.appendChild(tbl);

      history.className = '';
      history.replaceChildren(table);

      message('statsSubtitle', 'Your saved results, newest first.');

    } catch (error) {
      console.error('D1 STATS ERROR:', error);

      history.className = 'stats-empty';
      history.textContent =
        'Could not load stats. Check your Firestore connection and security rules.';

      message(
        'statsSubtitle',
        'Stats could not be loaded: ' + friendlyError(error)
      );

    } finally {
      statsBusy = false;
    }
  }

})();
