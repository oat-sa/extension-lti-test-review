<div class="next-prev">
{{#each buttons}}
    <button data-control="{{control}}" class="small btn-info btn-group action{{#unless text}} no-label{{/unless}}{{#unless icon}} no-icon{{/unless}} {{cls}}" title="{{title}}" tabindex="0">
        {{#if icon}}
            <span class="icon icon-{{icon}}"></span>
        {{/if}}
        {{#if text}}
            <span class="label">{{text}}</span>
        {{/if}}
    </button>
{{/each}}
</div>

