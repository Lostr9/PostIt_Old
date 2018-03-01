function Unixtime (dd, mm, yyyy, hh, mni){
	year = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    hh -= 3;
    yyyy = yyyy - 1970;
    if (yyyy % 4 == 0)
    {
        if (yyyy % 100 == 0)
        {
            if (yyyy % 400 == 0)
                dd += ( (yyyy - 2) / 4 ) + 1;
            else
                dd += ( (yyyy - 2) / 4 );
        }
        else
            dd += ( (yyyy - 2) / 4 ) + 1;
    }
    else
        dd += ( (yyyy - 2) / 4 );
    for (i = 0; i < mm- 1; i++)
        dd += year[i];
    unixtime = (yyyy * 31536000) + (dd * 86400) + (hh * 3600) + (mni * 60);
    return unixtime;
}
function Pars_post_time(y_m_d, h_m, func){
    //2016-06-02
    //01:02
    year = '';
    month = '';
    day ='';
    hour = '';
    minute = '';
    i = 0;
    for (i; i<10; i++){
        if (i < 2){
            year += y_m_d[i];
            month += y_m_d[i+5];
            day += y_m_d[i+8]
        }
        else
            year += y_m_d[i];
    }
    hour = h_m[0] + h_m[1];
    minute = h_m[3] + h_m[4];
    return func(parseInt(day), parseInt(month), parseInt(year), parseInt(hour), parseInt(minute));
}
function Pars_reg_data(str){
    month = "";
    day = "";
    year = "";
    time = "";
    pars_data = "";
    for (i = 4; ;i++){
        if (created[i] != " ")
            month += created[i];
        else
            break;
    }
    i++;
    for(i; ;i++){
        if (created[i] != ' ')
            day += created[i];
        else
            break;
    }
    i++;
    for(i; ;i++){
        if (created[i] != ' ')
            year += created[i];
        else
            break;
    }
    i++;
    flag = 0;
    for(i; ;i++){
        if (created[i] == ':'){
            if (flag == 1)
                break;
            else{
                time += created[i];
                flag = 1;
            } 
        }
        else
            time += created[i];
    }
    pars_data = day + " " + month + " " + year + " " + time;
    return pars_data;
}
function Pars_token(str){
    access_token = "";
    for(i=45; ; i++){
        if (str[i] != "&")
        {
            access_token = access_token + str[i];
        }
        else
            break;            
    }
    return access_token;
}
function Pars_id(str){
    id = "";
    for(i=152; i < 160; i++){
        id = id + str[i];
    }
    return id;
}
exports.Unixtime = Unixtime;
exports.Pars_post_time = Pars_post_time;
exports.Pars_reg_data = Pars_reg_data;
exports.Pars_token = Pars_token;
exports.Pars_id = Pars_id;