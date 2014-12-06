package com.purplefoto.cgeogear;

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
	
	private String name;
	private String code;
	private double lat;
	private double lon;
	private String hint;
	
}
