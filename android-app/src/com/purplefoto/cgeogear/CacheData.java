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

import android.content.Context;
import android.net.Uri;

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
	public String toString(Context mContext){
		String ret = "http://localhost?" +
				mContext.getString(R.string.notification_url_gccode) + "=" + Uri.encode(this.code) + "&" +
				mContext.getString(R.string.notification_url_gcname) + "=" + Uri.encode(this.name) + "&" +
				mContext.getString(R.string.notification_url_lat) + "=" + String.format("%.5f", this.lat) + "&" +
				mContext.getString(R.string.notification_url_lon) + "=" + String.format("%.5f", this.lon) + "&" +
				mContext.getString(R.string.notification_url_gchint) + "=" + Uri.encode(this.hint)
				;
		
		
		return ret;
	}
	
	private String name;
	private String code;
	private double lat;
	private double lon;
	private String hint;
	
}
