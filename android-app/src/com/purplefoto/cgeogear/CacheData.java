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

import java.util.ArrayList;
import java.util.UUID;

import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.net.Uri;

import com.samsung.android.sdk.richnotification.SrnAction;
import com.samsung.android.sdk.richnotification.SrnAction.CallbackIntent;
import com.samsung.android.sdk.richnotification.SrnImageAsset;
import com.samsung.android.sdk.richnotification.SrnRichNotification;
import com.samsung.android.sdk.richnotification.SrnRichNotification.AlertType;
import com.samsung.android.sdk.richnotification.SrnRichNotificationManager;
import com.samsung.android.sdk.richnotification.actions.SrnRemoteLaunchAction;
import com.samsung.android.sdk.richnotification.templates.SrnStandardTemplate;
import com.samsung.android.sdk.richnotification.templates.SrnStandardTemplate.HeaderSizeType;

/*
 * Container for cache related data
 */
public class CacheData {

	public CacheData(String name, String code, double lat, double lon,
			String hint) {
		super();
		this.name = name;
		this.code = code;
		this.lat = lat;
		this.lon = lon;
		this.hint = hint;
	}

	public CacheData() {
		this.name = "";
		this.code = "";
		this.lat = 0d;
		this.lon = 0d;
		this.hint = "";
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public double getLat() {
		return lat;
	}

	public void setLat(double lat) {
		this.lat = lat;
	}

	public double getLon() {
		return lon;
	}

	public void setLon(double lon) {
		this.lon = lon;
	}

	public String getHint() {
		return hint;
	}

	public void setHint(String hint) {
		this.hint = hint;
	}

	public String makeString(Context context) {
		String ret = "http://localhost?"
				+ context.getString(R.string.notification_url_gccode) + "="
				+ Uri.encode(this.code) + "&"
				+ context.getString(R.string.notification_url_gcname) + "="
				+ Uri.encode(this.name) + "&"
				+ context.getString(R.string.notification_url_lat) + "="
				+ Uri.encode(String.format("%.5f", this.lat)) + "&"
				+ context.getString(R.string.notification_url_lon) + "="
				+ Uri.encode(String.format("%.5f", this.lon)) + "&"
				+ context.getString(R.string.notification_url_gchint) + "="
				+ Uri.encode(this.hint);

		return ret;
	}

	private SrnRichNotification createRichNotification(Context context) {

		// Create the small template header
		SrnStandardTemplate smallHeaderTemplate = new SrnStandardTemplate(
				HeaderSizeType.SMALL);

		String body = getName()
				+ "<br/>"
				+ String.format("%2d %2.3f", (int) this.lat,
						java.lang.Math.abs(this.lat - (int) this.lat) * 60)
				+ "<br/>"
				+ String.format("%2d %2.3f", (int) this.lon,
						java.lang.Math.abs(this.lon - (int) this.lon) * 60);
		
		// Test
		// body += "<br/>[" + this.makeString(context) + "]";
		
		smallHeaderTemplate.setSubHeader(getCode());
		smallHeaderTemplate.setBody(body);
		smallHeaderTemplate.setBackgroundColor(Color.rgb(69, 114, 32));

		// Create the actions
		ArrayList<SrnAction> actions = new ArrayList<SrnAction>();
		SrnRemoteLaunchAction primaryAction = new SrnRemoteLaunchAction(
				context.getString(R.string.navigate));
		Bitmap primaryActionIcon = BitmapFactory.decodeResource(
				context.getResources(), R.drawable.ic_pin_drop);
		SrnImageAsset naviIcon = new SrnImageAsset(context, "web_icon",
				primaryActionIcon);
		primaryAction.setIcon(naviIcon);

		primaryAction.setPackage(context.getString(R.string.gear_package_name));
		primaryAction.setData(Uri.parse(this.makeString(context)));

		Intent resultIntent = new Intent(context,
				GearNotificationCallbackActivity.class);
		primaryAction.setCallbackIntent(CallbackIntent
				.getActivityCallback(resultIntent));

		actions.add(primaryAction);

		// Create the icon for the notification
		Bitmap appIconBitmap = BitmapFactory.decodeResource(
				context.getResources(), R.drawable.ic_my_location);
		SrnImageAsset appIcon = new SrnImageAsset(context, "app_icon",
				appIconBitmap);

		// Create notification object and assign values
		SrnRichNotification notification = new SrnRichNotification(context);

		notification.setReadout(
				context.getString(R.string.search_for_geocache), getCode());
		notification.setPrimaryTemplate(smallHeaderTemplate);
		notification.setTitle(context.getString(R.string.app_name));
		notification.setAlertType(AlertType.VIBRATION);
		notification.setIcon(appIcon);
		notification.addActions(actions);

		return notification;
	}

	/*
	 * sendToGear Send data from intent to Gear watch. This is the interface to
	 * the Samsung Notification UI.
	 */
	public UUID sendToGear(Context context, SrnRichNotificationManager srnManager) {
		SrnRichNotification notification = createRichNotification(context);
		if (notification == null)
			return null;
		return srnManager.notify(notification);
	}

	private String name;
	private String code;
	private double lat;
	private double lon;
	private String hint;
}
