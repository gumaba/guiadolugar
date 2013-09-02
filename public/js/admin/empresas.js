$(function () {
    $.typeaheadCidades($('#add-empresa-form'));
    $.typeaheadEstados($('#add-empresa-form'));

    $(document).on('click', '.videos-remove-video', function(){
        var value = $(this).attr('data-value');
        $(this).parents('.video-holder').remove();
    });

    $(document).on('click', '.telefone-badge-remove', function(){
        $(this).parents('.telefone-badge').remove();
    });

    $("#add-video-button").click(function () {
        var iframe = '<div class="video-holder"><input type="hidden" name="videos[]" value="%s" /><div><a href="javascript:;" class="videos-remove-video" data-value="%s">Remover Vídeo</a></div><iframe width="300" height="200" src="http://www.youtube.com/embed/%s?autoplay=0" style="margin-right:10px" frameborder="0"></iframe></div>';
        var videoId = $('#add-video-input').val();
        $("#videos-showcase").append(_.str.sprintf(iframe, videoId, videoId, videoId));
        $("#videos-ids").append($('<input/>').attr('type', 'hidden').attr('name', 'videos[]').val(videoId));
        $('#add-video-input').val('');
        return false;
    });
    $("#add-telefones-button").click(function () {
        var id = uniqid();

        var telefone = $('#add-telefones-input-number').val();
        var ddd = $('#add-telefones-input-ddd').val();
        var tipo = $('#add-telefones-input-name').find('option:selected').val();
        var tipoText = $('#add-telefones-input-name').find('option:selected').text();

        var iframe = '<span class="badge badge-lime telefone-badge" style="margin-right: 5px">' +
            '<input type="hidden" name="telefones[%s][tipo]" value="%s" />' +
            '<input type="hidden" name="telefones[%s][ddd]" value="%s" />' +
            '<input type="hidden" name="telefones[%s][telefone]" value="%s" />' +
            '<a href="javascript:;" class="icon-remove telefone-badge-remove"></a>' +
            ' [%s] %s %s</span>';

        $("#telefones-showcase").append(_.str.sprintf(iframe, id, tipo, id, ddd, id, telefone, tipoText, ddd, telefone));

        $('#add-telefone-input').val('');
        return false;
    });
});