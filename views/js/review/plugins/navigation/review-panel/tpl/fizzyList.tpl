<ul class="review-panel-sections">
    {{#each sections}}
    <li class="review-panel-section">
        {{#if ../displaySectionTitles}}
            <span class="review-panel-label" title="{{label}}">
                <span class="review-panel-text">{{label}}</span>
            </span>
        {{/if}}
        <div class="review-panel-items"></div>
    </li>
    {{/each}}
</ul>