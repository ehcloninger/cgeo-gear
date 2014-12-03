/*
 * Copyright (C) 2007 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.purplefoto.cgeogear;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import cgeo.geocaching.Intents;

/**
 * This class provides a basic demonstration of how to write an Android
 * activity. Inside of its window, it places a single view: an EditText that
 * displays and edits some internal text.
 */
public class CgeoGearMainActivity extends Activity {

	public CgeoGearMainActivity() {
	}

	TextView gccode = null;
	TextView gcname = null;
	TextView gclat = null;
	TextView gclon = null;
	TextView gchint = null;

	private String code;
	private String name;
	private double lat = 0d;
	private double lon = 0d;
	private String hint;
	private Button button = null;

	/** Called with the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		// Inflate our UI from its XML layout description.
		setContentView(R.layout.main_activity);

		button = (Button) findViewById(R.id.send);
		button.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				if ((lat == 0d) && (lon == 0d)) {
					PackageManager manager = getPackageManager();
					try {
						final Intent launchIntent = manager
								.getLaunchIntentForPackage("cgeo.geocaching");
						if (launchIntent == null)
							throw new PackageManager.NameNotFoundException();
						launchIntent.addCategory(Intent.CATEGORY_LAUNCHER);
						CgeoGearMainActivity.this.startActivity(launchIntent);
					} catch (PackageManager.NameNotFoundException e) {
						Toast.makeText(CgeoGearMainActivity.this,
								R.string.cgeo_not_installed, Toast.LENGTH_LONG)
							.show();
					}
				} else {
					
					// TODO: Insert Gear notification code here
					
					Toast.makeText(CgeoGearMainActivity.this,
							"(" + code + ") " + name, 
							Toast.LENGTH_LONG)
						.show();
					
					CgeoGearMainActivity.this.finish();
				}
			}
		});
	}

	void setActivityLayoutData(Intent intent) {
		if (intent == null)
			return;

		name = intent.getStringExtra(Intents.EXTRA_NAME);
		code = intent.getStringExtra(Intents.EXTRA_GEOCODE);
		lat = intent.getDoubleExtra(Intents.EXTRA_LATITUDE, 0d);
		lon = intent.getDoubleExtra(Intents.EXTRA_LONGITUDE, 0d);
		hint = intent.getStringExtra(Intents.EXTRA_HINT);

		if ((lat == 0d) && (lon == 0d)) {
			button.setText(R.string.start_cgeo);
			gchint.setText(R.string.description);
		} else {
			button.setText(R.string.send_to_gear);

			gccode.setText(code);
			gcname.setText(name);
			gclat.setText(String.format("%.0f", lat));
			gclon.setText(String.format("%.0f", lon));

			/*
			 * Comment this out for production. Only pass along the hint to the
			 * watch, so it doesn't spoil the hunt for the user
			 */
			// gchint.setText(hint);
		}
	}

	@Override
	protected void onNewIntent(Intent intent) {
		super.onNewIntent(intent);

		/*
		 * This doesn't quite feel right. I get 2 intents when I'm started from
		 * c:geo. The first one has all the data from the cache record and the
		 * second is a launch from MAIN. We never need to update the UI based on
		 * MAIN launcher events, so just eat it.
		 * 
		 * TODO: Research the Android lifecycle to find a better way to handle
		 * this.  Update, setIntent seems to fix this, but I'm going to leave this
		 * comment in, just in case it pops up again.
		 */
		String action = intent.getAction();
		if (action != null)
			if (action.equals("android.intent.action.MAIN"))
				return;

		this.setIntent(intent);
		setActivityLayoutData(intent);
	}

	/**
	 * Called when the activity is about to start interacting with the user.
	 */
	@Override
	protected void onResume() {
		super.onResume();

		gccode = (TextView) this.findViewById(R.id.gccode);
		gcname = (TextView) this.findViewById(R.id.gcname);
		gclat = (TextView) this.findViewById(R.id.gclat);
		gclon = (TextView) this.findViewById(R.id.gclon);
		gchint = (TextView) this.findViewById(R.id.gchint);

		setActivityLayoutData(this.getIntent());
	}
}
