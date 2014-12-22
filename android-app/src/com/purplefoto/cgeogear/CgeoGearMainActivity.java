/*
	Copyright 2014 Eric Cloninger (purplefoto.com)
	
	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at
		http://www.apache.org/licenses/LICENSE-2.0
	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
 */

package com.purplefoto.cgeogear;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.SharedPreferences.OnSharedPreferenceChangeListener;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.util.Log;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;

/**
 * This is the basic UX for cgeo-gear when launched from app tray. If the user starts the app, it 
 * displays the usage information and prompts them to launch c:geo. The rest of the user interaction
 * comes from launching via c:geo
 */
public class CgeoGearMainActivity extends Activity {
	// Until it's in c:geo sources...
	// static final String EXTRA_HINT = "cgeo.geocaching.intent.extra.hint";

	public CgeoGearMainActivity() {
	}

	private ImageButton button = null;
	private TextView description = null;

    boolean m_enabled = true;

	/** Called with the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		// Inflate our UI from its XML layout description.
		setContentView(R.layout.main_activity);

		SharedPreferences preferences = PreferenceManager
				.getDefaultSharedPreferences(getApplicationContext());

		m_enabled = preferences.getBoolean("enabled", true);

		/*
		 * onSharedPreferenceChanged
		 * 
		 * Listener to detect when the user has changed a preference
		 */
		preferences
				.registerOnSharedPreferenceChangeListener(new OnSharedPreferenceChangeListener() {
					public void onSharedPreferenceChanged(
							SharedPreferences sharedPreferences, String key) {
					}
				});
		
        description = (TextView) findViewById(R.id.description);

        button = (ImageButton) findViewById(R.id.launch_cgeo);
		button.setOnClickListener(new View.OnClickListener() {
			public void onClick(View v) {
				final Intent launchIntent = getCgeoIntent();
				if (launchIntent == null)
					Toast.makeText(CgeoGearMainActivity.this, R.string.cgeo_not_installed, Toast.LENGTH_LONG).show();
				else
				{
					CgeoGearMainActivity.this.startActivity(launchIntent);
					CgeoGearMainActivity.this.finish();
				}
			}
		});
	}

	/*
	 * onRestoreInstanceState - lifecycle events that cause the Activity
	 * to go away, such as rotation, phone calls, etc.
	 * 
	 * @see android.app.Activity#onRestoreInstanceState(android.os.Bundle)
	 */
	protected void onRestoreInstanceState(Bundle savedInstanceState) {
		super.onRestoreInstanceState(savedInstanceState);
		Log.i(getPackageName(), "onRestoreInstanceState");

		m_enabled = savedInstanceState.getBoolean("enabled");
	}

	/*
	 * PFDock.onSaveInstanceState
	 * 
	 * @see android.app.Activity#onSaveInstanceState(android.os.Bundle)
	 */
	protected void onSaveInstanceState(Bundle outState) {
		// Save the last known latitude and longitude for fast restarts of the
		// maps service
		Log.i(getPackageName(), "onSaveInstanceState");
		outState.putBoolean("enabled", m_enabled);

		super.onSaveInstanceState(outState);
	}

	/*
	 * onCreateOptionsMenu
	 * 
	 * @see android.app.Activity#onCreateOptionsMenu(android.view.Menu)
	 */
	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		MenuInflater inflater = getMenuInflater();
		inflater.inflate(R.menu.main, menu);
		Log.i(getPackageName(), "onCreateOptionsMenu");

		return (super.onCreateOptionsMenu(menu));
	}

	/**
	 * Define menu action
	 * 
	 * @see android.app.Activity#onOptionsItemSelected(android.view.MenuItem)
	 */
	public boolean onOptionsItemSelected(MenuItem item) {
		Log.i(getPackageName(), "onOptionsItemSelected");
		if (item.getItemId() == R.id.settings) {
			// Show the preferences dialog (via a separate class)
			startActivity(new Intent(this, CgeoGearPreferences.class));
			return true;
		}

		return super.onOptionsItemSelected(item);
	}

	/*
	 * getCgeoIntent
	 * Retrieve reference to intent to launch c:geo. If c:geo not installed, returns null.
	 */
	private final Intent getCgeoIntent()
	{
		PackageManager manager = getPackageManager();
		
		// If package manager is null, you're hosed.
		// TODO: put in a toast on null
		if (manager == null)
			return null;
			
		return manager.getLaunchIntentForPackage("cgeo.geocaching");
	}

	/*
	 * onResume
	 * Called from lifecycle when user resumes. 
	 * 
	 * (non-Javadoc)
	 * @see android.app.Activity#onResume()
	 */
	@Override
	protected void onResume() {
		super.onResume();
		
		// Set icon of launch button and description text, depending on whether c:geo is installed or not
		Bitmap bitmap = null;
		int bitmapResourceID = R.drawable.cgeo;

		final Intent launchIntent = getCgeoIntent();
		if (launchIntent == null)
		{
			bitmapResourceID = R.drawable.cgeo_not_installed;
			description.setText(R.string.description_not_installed);
		}
		else
		{
			description.setText(R.string.description);
		}

		bitmap = BitmapFactory.decodeResource(getResources(), bitmapResourceID);
		button.setImageBitmap(bitmap);
	}
	
	/*
	 * onPause
	 * Lifecycle override
	 * 
	 * (non-Javadoc)
	 * @see android.app.Activity#onPause()
	 */
    @Override
    protected void onPause() {
        super.onPause();
    }
}
