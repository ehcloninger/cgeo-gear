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

// Adapted from sample code on developer.samsung.com/gear

package com.purplefoto.cgeogear;

import java.util.ArrayList;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;

import com.samsung.android.sdk.richnotification.SrnAction;
import com.samsung.android.sdk.richnotification.SrnImageAsset;
import com.samsung.android.sdk.richnotification.SrnRichNotification;
import com.samsung.android.sdk.richnotification.SrnRichNotification.AlertType;
import com.samsung.android.sdk.richnotification.actions.SrnHostAction;
import com.samsung.android.sdk.richnotification.templates.SrnStandardTemplate;
import com.samsung.android.sdk.richnotification.templates.SrnStandardTemplate.HeaderSizeType;

public class CacheNotification {

    private final Context mContext;
    private final CacheData mCacheData;

    public CacheNotification(Context ctx, CacheData cacheData) {
        mContext = ctx;
        mCacheData = cacheData;
    }

    public SrnRichNotification createRichNotification() {

    	// Create the small template header
    	SrnStandardTemplate smallHeaderTemplate = new SrnStandardTemplate(HeaderSizeType.SMALL);
		
		String body = mCacheData.getName() + "<br/>" + 
				String.format("%2d %2.3f", (int) mCacheData.getLat(), java.lang.Math.abs(mCacheData.getLat() - (int) mCacheData.getLat()) * 60 ) + "<br/>" +
				String.format("%2d %2.3f", (int) mCacheData.getLon(), java.lang.Math.abs(mCacheData.getLon() - (int) mCacheData.getLon()) * 60 );
        smallHeaderTemplate.setSubHeader(mCacheData.getCode());
        smallHeaderTemplate.setBody(body);
        smallHeaderTemplate.setBackgroundColor(Color.rgb(69, 114, 32));

        // Create the actions
        // TODO: Figure out why Action button colors are close to background color
        ArrayList<SrnAction> actions = new ArrayList<SrnAction>();
        SrnHostAction primaryAction = new SrnHostAction(mContext.getString(R.string.navigate));
        Bitmap primaryActionIcon = BitmapFactory.decodeResource(mContext.getResources(), R.drawable.ic_pin_drop);
        SrnImageAsset naviIcon = new SrnImageAsset(mContext, "web_icon", primaryActionIcon);

//        String url = "http://musicmp3.ru/artist_taylor-swift__album_red.html#.U-Cj3WPzkjY";
//        Intent resultIntent = new Intent(mContext, GearNotificationCallbackActivity.class);
//        resultIntent.setData(Uri.parse(url));

        primaryAction.setIcon(naviIcon);
        
        // TODO: Instead of toast, launch widget on watch
        primaryAction.setToast(mContext.getString(R.string.lets_go));
//        primaryAction.setCallbackIntent(CallbackIntent.getActivityCallback(resultIntent));

        actions.add(primaryAction);
        
        // Create the icon for the notification
        Bitmap appIconBitmap = BitmapFactory.decodeResource(mContext.getResources(), R.drawable.ic_my_location);
        SrnImageAsset appIcon = new SrnImageAsset(mContext, "app_icon", appIconBitmap);

        // Create notification object and assign values
        SrnRichNotification notification = new SrnRichNotification(mContext);
        
        notification.setReadout(mContext.getString(R.string.search_for_geocache), mCacheData.getCode());
        notification.setPrimaryTemplate(smallHeaderTemplate);
        notification.setTitle(mContext.getString(R.string.app_name));
        notification.setAlertType(AlertType.VIBRATION);
        notification.setIcon(appIcon);
        notification.addActions(actions);

        return notification;
    }
}
