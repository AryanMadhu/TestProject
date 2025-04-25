package com.example.exam.utils;

import java.io.IOException;
import java.io.Writer;
import java.util.List;

import com.example.exam.entity.AdminUser;
import com.example.exam.proxy.AdminUserProxy;

public class CsvUtils {
	
	public static void writeUsersToCsv(List<AdminUserProxy> users, Writer writer) throws IOException {
        // Header
        writer.write("Name,Email,DOB,Gender,Contact,Address,PinCode,Role\n");
        for (AdminUserProxy u : users) {
            writer.write(String.format(
                "\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                u.getName(),
                u.getEmail(),
                u.getDob().toString(),
                u.getGender().name(),
                u.getContactNumber(),
                u.getAddress().replace("\"","\"\""),
                u.getPinCode(),
                u.getRole().name()
            ));
        }
        writer.flush();
    }
}
