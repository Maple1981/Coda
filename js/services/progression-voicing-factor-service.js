// Chord factor roles, omissions and doublings for voicing construction.
(function (global) {
	'use strict';

	var chordQuality = global.CodaProgressionChordQuality;

	function prepareBaseNotesForVoiceCount(baseNotes, kind, voiceCount, chordName) {
		var roles = factorRolesForKind(kind);
		var selectedNotes = [];
		var selectedRoles = [];
		var allowedRoles;

		if (kind !== 'seventh' || voiceCount !== 3 || baseNotes.length < 4) {
			return {
				notes: baseNotes.slice(),
				roles: roles
			};
		}

		allowedRoles = chordQuality.isDiminishedSeventhQuality(chordName) ?
			{ fifth: true, root: true, third: true } :
			{ root: true, seventh: true, third: true };

		for (var i = 0; i < baseNotes.length; i++) {
			if (allowedRoles[roles[i]]) {
				selectedNotes.push(baseNotes[i]);
				selectedRoles.push(roles[i]);
			}
		}

		return {
			notes: selectedNotes,
			roles: selectedRoles
		};
	}

	function factorRolesForKind(kind) {
		return kind === 'seventh' ? ['root', 'third', 'fifth', 'seventh'] : ['root', 'third', 'fifth'];
	}

	function duplicateFactor(baseNotes, role, kind) {
		var roleIndex = {
			fifth: 2,
			root: 0,
			seventh: kind === 'seventh' ? 3 : 0,
			third: 1
		}[role];

		return {
			note: baseNotes[Math.min(roleIndex, baseNotes.length - 1)] || baseNotes[0],
			role: role
		};
	}

	global.CodaProgressionVoicingFactors = {
		duplicateFactor: duplicateFactor,
		factorRolesForKind: factorRolesForKind,
		prepareBaseNotesForVoiceCount: prepareBaseNotesForVoiceCount
	};
})(window);
